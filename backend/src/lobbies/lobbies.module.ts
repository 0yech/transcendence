import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LobbiesController } from './lobbies.controller';
import { LobbiesService } from './lobbies.service';

@Module({
  imports: [PrismaModule],
  controllers: [LobbiesController],
  providers: [LobbiesService],
})
export class LobbiesModule {}
