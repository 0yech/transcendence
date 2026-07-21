import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { LobbiesService } from './lobbies.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('lobbies')
export class LobbiesController {
  constructor(private readonly lobbiesService: LobbiesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createLobby(
    @CurrentUser() user: JwtPayload,
    @Body() body: { private?: boolean; password?: string },
  ) {
    return this.lobbiesService.createLobby(user.sub, body);
  }

  @Get()
  findActiveLobbies() {
    return this.lobbiesService.findActiveLobbies();
  }

  @Get(':code')
  findLobbyByCode(@Param('code') code: string) {
    return this.lobbiesService.findLobbyByCode(code);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':code/join')
  joinLobby(
    @CurrentUser() user: JwtPayload,
    @Param('code') code: string,
    @Body() body: { password?: string },
  ) {
    return this.lobbiesService.joinLobby(code, user.sub, body?.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('leave')
  leaveLobby(@CurrentUser() user: JwtPayload) {
    return this.lobbiesService.leaveLobby(user.sub);
  }
}
