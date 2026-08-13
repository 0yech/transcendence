import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';
import { GamesController } from './games.controller';
import { GamesGateway } from './games.gateway';
import { GamesService } from './games.service';

@Module({
  imports: [PrismaModule],
  controllers: [GamesController],
  providers: [GamesService, GamesGateway],
})
export class GamesModule {}
