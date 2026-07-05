import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GuildsController } from './guilds.controller';
import { GuildsService } from './guilds.service';

@Module({
  imports: [PrismaModule],
  controllers: [GuildsController],
  providers: [GuildsService],
})
export class GuildsModule {}
