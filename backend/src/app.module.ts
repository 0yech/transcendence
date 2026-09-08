import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import { GamesModule } from './games/games.module';
import { GuildsModule } from './guilds/guilds.module';
import { LobbiesModule } from './lobbies/lobbies.module';
import { UsersModule } from './users/users.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    LobbiesModule,
    GuildsModule,
    GamesModule,
    ChatsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global, so an untranslated Prisma error can never reach a client as a
    // 500. Route-scoped filters still win over this one: the OAuth callbacks
    // keep their own redirect behaviour.
    { provide: APP_FILTER, useClass: PrismaExceptionFilter },
  ],
})
export class AppModule {}
