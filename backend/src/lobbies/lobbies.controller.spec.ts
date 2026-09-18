import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { JwtAuthGuard } from '../auth/auth.guard';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { buildValidationPipe } from '../common/validation-pipe';
import { LobbiesController } from './lobbies.controller';
import { LobbiesService } from './lobbies.service';

/**
 * These tests only cover the HTTP layer. The service is a mock, so they show
 * what the controller lets through to it, not what the service does next.
 */
describe('LobbiesController', () => {
  const user: JwtPayload = { sub: 'user-id', username: 'user' };
  const lobbiesService = { createLobby: jest.fn() };
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [LobbiesController],
      providers: [{ provide: LobbiesService, useValue: lobbiesService }],
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

  describe('POST /lobbies', () => {
    it('passes the private setting to the service', async () => {
      await request(app.getHttpServer())
        .post('/lobbies')
        .send({ private: true })
        .expect(201);

      expect(lobbiesService.createLobby).toHaveBeenCalledWith(user.sub, {
        private: true,
      });
    });

    it('accepts a body without the private setting', async () => {
      await request(app.getHttpServer()).post('/lobbies').send({}).expect(201);

      expect(lobbiesService.createLobby).toHaveBeenCalledWith(user.sub, {});
    });

    it('rejects a private setting that is not a boolean', async () => {
      await request(app.getHttpServer())
        .post('/lobbies')
        .send({ private: 'yes' })
        .expect(400);

      expect(lobbiesService.createLobby).not.toHaveBeenCalled();
    });
  });
});
