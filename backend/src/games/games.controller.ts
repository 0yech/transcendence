import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(
    private readonly gamesService: GamesService,
  ) {}
  /**
   * Replay is read-only historical data.
   *
   * Unlike the live game logic, it does not require realtime
   * communication and therefore remains exposed through HTTP.
   */
  @Get(':gameId/replay')
  getReplay(
    @Param('gameId')
    gameId: string,

    @CurrentUser()
    user: JwtPayload,
  ) {
    return this.gamesService.getReplay(
      gameId,
    );
  }
}