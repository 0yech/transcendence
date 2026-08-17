import { Controller, Get, Param } from '@nestjs/common';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}
  /**
   * Replay is read-only historical data.
   *
   * Unlike the live game logic, it does not require realtime
   * communication and therefore remains exposed through HTTP.
   */
  @Get(':gameId/replay')
  getReplay(@Param('gameId') gameId: string) {
    return this.gamesService.getReplay(gameId);
  }
}
