import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatsModule } from '../chats/chats.module';
import { LobbiesController } from './lobbies.controller';
import { LobbiesService } from './lobbies.service';

@Module({
  imports: [PrismaModule, ChatsModule],
  controllers: [LobbiesController],
  providers: [LobbiesService],
})
export class LobbiesModule {}
