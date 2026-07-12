import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { GamesService } from './games.service';

@UseGuards(AuthGuard)
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post('lobbies/:lobbyCode/start')
  startFromLobby(
    @Param('lobbyCode') lobbyCode: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.gamesService.startFromLobby(lobbyCode, user.sub);
  }

  @Get(':gameId')
  getGame(@Param('gameId') gameId: string, @CurrentUser() user: JwtPayload) {
    return this.gamesService.getGame(gameId, user.sub);
  }

  /**
   * Real API endpoint.
   * The frontend can send the exact card id.
   */
  @Post(':gameId/play')
  playCard(
    @Param('gameId') gameId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { cardId: string },
  ) {
    return this.gamesService.playCard(gameId, user.sub, body.cardId);
  }

  /**
   * Human-friendly endpoint.
   * Useful for curl tests and also valid for a simple UI.
   *
   * slot = 1 means first card in hand
   * slot = 2 means second card in hand
   * etc.
   */
  @Post(':gameId/play-slot')
  playSlot(
    @Param('gameId') gameId: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { slot: number },
  ) {
    return this.gamesService.playSlot(gameId, user.sub, body.slot);
  }

  @Post(':gameId/unable')
  unableToPlay(
    @Param('gameId') gameId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.gamesService.unableToPlay(gameId, user.sub);
  }

  @Post(':gameId/discard-four-ono99')
  discardFourOno99(
    @Param('gameId') gameId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.gamesService.discardFourOno99(gameId, user.sub);
  }

  @Get(':gameId/replay')
  getReplay(@Param('gameId') gameId: string, @CurrentUser() user: JwtPayload) {
    return this.gamesService.getReplay(gameId, user.sub);
  }
}
