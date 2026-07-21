import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { GamesService } from './games.service';

@UseGuards(JwtAuthGuard)
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

  @Get(':lobbyCode')
  getGame(
    @Param('lobbyCode') lobbyCode: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.gamesService.getGame(lobbyCode, user.sub);
  }

  /**
   * Real API endpoint.
   * The frontend can send the exact card id.
   */
  @Post(':lobbyCode/play')
  playCard(
    @Param('lobbyCode') lobbyCode: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { cardId: string },
  ) {
    return this.gamesService.playCard(lobbyCode, user.sub, body.cardId);
  }

  /**
   * Human-friendly endpoint.
   * Useful for curl tests and also valid for a simple UI.
   *
   * slot = 1 means first card in hand
   * slot = 2 means second card in hand
   * etc.
   */
  @Post(':lobbyCode/play-slot')
  playSlot(
    @Param('lobbyCode') lobbyCode: string,
    @CurrentUser() user: JwtPayload,
    @Body() body: { slot: number },
  ) {
    return this.gamesService.playSlot(lobbyCode, user.sub, body.slot);
  }

  @Post(':lobbyCode/unable')
  unableToPlay(
    @Param('lobbyCode') lobbyCode: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.gamesService.unableToPlay(lobbyCode, user.sub);
  }

  @Post(':lobbyCode/discard-four-ono99')
  discardFourOno99(
    @Param('lobbyCode') lobbyCode: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.gamesService.discardFourOno99(lobbyCode, user.sub);
  }

  @Get(':gameId/replay')
  getReplay(@Param('gameId') gameId: string, @CurrentUser() user: JwtPayload) {
    return this.gamesService.getReplay(gameId, user.sub);
  }
}
