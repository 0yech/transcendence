import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LobbiesModule } from './lobbies/lobbies.module';

@Module({
  imports: [LobbiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
