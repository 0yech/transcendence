import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LobbiesService } from './lobbies.service';

@Controller('lobbies')
export class LobbiesController {
  constructor(private readonly lobbiesService: LobbiesService) {}

  @Post()
  createLobby(@Body() body: { private?: boolean; password?: string }) {
    return this.lobbiesService.createLobby(body);
  }

  @Get()
  findActiveLobbies() {
    return this.lobbiesService.findActiveLobbies();
  }

  @Get(':code')
  findLobbyByCode(@Param('code') code: string) {
    return this.lobbiesService.findLobbyByCode(code);
  }

  @Post(':code/join')
  joinLobby(@Param('code') code: string, @Body() body: { userId: string }) {
    return this.lobbiesService.joinLobby(code, body.userId);
  }

  @Post('leave')
  leaveLobby(@Body() body: { userId: string }) {
    return this.lobbiesService.leaveLobby(body.userId);
  }
}
