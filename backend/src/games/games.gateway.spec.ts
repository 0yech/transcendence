import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { AddressInfo } from 'net';
import { io, Socket } from 'socket.io-client';
import { buildValidationPipe } from '../common/validation-pipe';
import { GamesGateway } from './games.gateway';
import { GamesService } from './games.service';

/**
 * Emits an event and resolves with whichever arrives first: the handler's
 * acknowledgement, or the `exception` event that a rejected payload causes.
 */
function emit(client: Socket, event: string, payload?: unknown) {
  return new Promise<{ ack?: unknown; exception?: unknown }>((resolve) => {
    client.once('exception', (exception: unknown) => resolve({ exception }));
    client.emit(event, payload, (ack: unknown) => resolve({ ack }));
  });
}

describe('GamesGateway (payload validation)', () => {
  const gamesService = {
    startFromLobby: jest.fn(),
    playSlot: jest.fn(),
  };
  let app: INestApplication;
  let client: Socket;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GamesGateway,
        { provide: GamesService, useValue: gamesService },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn().mockResolvedValue({ sub: 'me' }) },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(buildValidationPipe());
    await app.listen(0);

    const { port } = app.getHttpServer().address() as AddressInfo;

    client = io(`http://localhost:${port}/games`, {
      // Lowercase: Node lowercases header names, and the gateway reads
      // `handshake.headers.cookie`.
      extraHeaders: { cookie: 'access_token=a-token' },
      transports: ['websocket'],
    });

    await new Promise<void>((resolve) =>
      client.once('connect', () => resolve()),
    );
  });

  afterAll(async () => {
    client.close();
    await app.close();
  });

  afterEach(() => {
    client.off('exception');
    jest.clearAllMocks();
  });

  // Sending no payload at all used to throw a TypeError outside the handler's
  // try/catch, so the client only ever saw "Internal server error".
  it('rejects an event sent with no payload', async () => {
    const { exception } = await emit(client, 'game:start');

    expect(JSON.stringify(exception)).toContain('lobby code');
    expect(gamesService.startFromLobby).not.toHaveBeenCalled();
  });

  it('rejects a lobby code that is not a string', async () => {
    const { exception } = await emit(client, 'game:start', { lobbyCode: 123 });

    expect(JSON.stringify(exception)).toContain('lobby code');
    expect(gamesService.startFromLobby).not.toHaveBeenCalled();
  });

  it('rejects a slot outside the hand', async () => {
    const { exception } = await emit(client, 'game:play-slot', {
      lobbyCode: 'ABC123',
      slot: 9,
    });

    expect(JSON.stringify(exception)).toContain('slot');
    expect(gamesService.playSlot).not.toHaveBeenCalled();
  });

  it('passes a valid payload to the service, uppercasing the code', async () => {
    gamesService.startFromLobby.mockResolvedValue({
      id: 'game-id',
      players: [],
    });

    const { ack } = await emit(client, 'game:start', { lobbyCode: ' abc123 ' });

    expect(ack).toEqual({ ok: true });
    expect(gamesService.startFromLobby).toHaveBeenCalledWith('ABC123', 'me');
  });
});
