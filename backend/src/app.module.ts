import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { LobbiesModule } from './lobbies/lobbies.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AuthModule, UsersModule, LobbiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
