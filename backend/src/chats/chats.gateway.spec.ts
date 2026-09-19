import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import type { AddressInfo } from 'net';
import { io, Socket } from 'socket.io-client';
import { buildValidationPipe } from '../common/validation-pipe';
import { PrismaService } from '../prisma/prisma.service';
import { ChatsGateway } from './chats.gateway';

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

describe('ChatsGateway (payload validation)', () => {
  const prisma = { lobby: { findFirst: jest.fn() } };
  let app: INestApplication;
  let client: Socket;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ChatsGateway,
        { provide: PrismaService, useValue: prisma },
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

    client = io(`http://localhost:${port}/chats`, {
      auth: { token: 'a-token' },
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

  it('rejects a payload with no code', async () => {
    const { exception } = await emit(client, 'lobby:join', {});

    expect(JSON.stringify(exception)).toContain('lobby code');
    expect(prisma.lobby.findFirst).not.toHaveBeenCalled();
  });

  it('rejects a code that is a Prisma filter rather than a string', async () => {
    const { exception } = await emit(client, 'lobby:join', {
      code: { not: '' },
    });

    expect(exception).toBeDefined();
    expect(prisma.lobby.findFirst).not.toHaveBeenCalled();
  });

  it('passes a valid code through to the lookup', async () => {
    prisma.lobby.findFirst.mockResolvedValue({
      id: 'lobby-id',
      code: 'ABC123',
      private: false,
      users: [{ id: 'me' }],
    });

    const { ack } = await emit(client, 'lobby:join', { code: 'ABC123' });

    expect(ack).toEqual({ success: true, lobbyCode: 'ABC123' });
  });
});
