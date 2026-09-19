import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../auth/auth.guard';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { buildValidationPipe } from '../common/validation-pipe';
import { GuildsController } from './guilds.controller';
import { GuildsService } from './guilds.service';

/**
 * These tests only cover the HTTP layer. The service is a mock, so they show
 * what the controller lets through to it, not what the service does next.
 */
describe('GuildsController', () => {
  const user: JwtPayload = { sub: 'user-id', username: 'user' };
  const guildsService = {
    createGuild: jest.fn(),
    renameGuild: jest.fn(),
    inviteUser: jest.fn(),
  };
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [GuildsController],
      providers: [{ provide: GuildsService, useValue: guildsService }],
    })
      // Skip the JWT check and act as a fixed, logged-in user.
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest<{ user: JwtPayload }>().user = user;
          return true;
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(buildValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  function post(path: string, body: object) {
    return request(app.getHttpServer()).post(path).send(body);
  }

  describe('POST /guilds', () => {
    it('passes a valid name to the service', async () => {
      await post('/guilds', { name: 'Valid' }).expect(201);

      expect(guildsService.createGuild).toHaveBeenCalledWith(user.sub, 'Valid');
    });

    it('trims the name before passing it on', async () => {
      await post('/guilds', { name: '  Valid  ' }).expect(201);

      expect(guildsService.createGuild).toHaveBeenCalledWith(user.sub, 'Valid');
    });

    it('rejects a name that is not a string', async () => {
      await post('/guilds', { name: 123 }).expect(400);

      expect(guildsService.createGuild).not.toHaveBeenCalled();
    });

    it('rejects unknown properties', async () => {
      await post('/guilds', { name: 'Valid', isAdmin: true }).expect(400);

      expect(guildsService.createGuild).not.toHaveBeenCalled();
    });
  });

  describe('POST /guilds/rename', () => {
    it('passes a valid name to the service', async () => {
      await post('/guilds/rename', { name: 'Valid' }).expect(201);

      expect(guildsService.renameGuild).toHaveBeenCalledWith(user.sub, 'Valid');
    });

    it('rejects a name that is not a string', async () => {
      await post('/guilds/rename', { name: 123 }).expect(400);

      expect(guildsService.renameGuild).not.toHaveBeenCalled();
    });
  });

  describe('POST /guilds/invitations', () => {
    it('passes a trimmed username to the service', async () => {
      await post('/guilds/invitations', { username: '  player1  ' }).expect(
        201,
      );

      expect(guildsService.inviteUser).toHaveBeenCalledWith(
        user.sub,
        'player1',
      );
    });

    it('rejects a blank username', async () => {
      await post('/guilds/invitations', { username: '   ' }).expect(400);

      expect(guildsService.inviteUser).not.toHaveBeenCalled();
    });

    it('rejects a username that is not a string', async () => {
      await post('/guilds/invitations', { username: 123 }).expect(400);

      expect(guildsService.inviteUser).not.toHaveBeenCalled();
    });
  });
});
