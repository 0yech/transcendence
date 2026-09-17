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
  const guildsService = { createGuild: jest.fn() };
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

  describe('POST /guilds', () => {
    it('passes a valid name to the service', async () => {
      guildsService.createGuild.mockResolvedValue({ id: 'guild-id' });

      await request(app.getHttpServer())
        .post('/guilds')
        .send({ name: 'Valid' })
        .expect(201);

      expect(guildsService.createGuild).toHaveBeenCalledWith(user.sub, 'Valid');
    });

    it('rejects a name that is not a string', async () => {
      await request(app.getHttpServer())
        .post('/guilds')
        .send({ name: 123 })
        .expect(400);

      expect(guildsService.createGuild).not.toHaveBeenCalled();
    });
  });
});
