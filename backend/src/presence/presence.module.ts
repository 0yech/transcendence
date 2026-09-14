import { Module } from '@nestjs/common';
import { PresenceService } from './presence.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PresenceService],
  exports: [],
})
export class PresenceModule {}
