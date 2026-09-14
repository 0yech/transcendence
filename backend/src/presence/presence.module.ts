import { Module } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { PresenceGateway } from './presence.gateway';

@Module({
  imports: [],
  controllers: [],
  providers: [PresenceService, PresenceGateway],
  exports: [],
})
export class PresenceModule {}
