import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { ChatsService } from './chats.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('lobbies/:code/messages')
@UseGuards(AuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Get()
  findLobbyMessages(
    @CurrentUser() user: JwtPayload,
    @Param('code') code: string,
  ) {
    return this.chatsService.findLobbyMessages(code, user.sub);
  }

  @Post()
  createLobbyMessage(
    @CurrentUser() user: JwtPayload,
    @Param('code') code: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.chatsService.createLobbyMessage(
      code,
      user.sub,
      createMessageDto.content,
    );
  }
}
