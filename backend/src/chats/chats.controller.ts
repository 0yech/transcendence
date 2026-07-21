import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { ChatsService } from './chats.service';
import { CreateMessageDto } from './dto/create-message.dto';

/**
 * @brief Handles HTTP requests related to lobby chat messages.
 *
 * Message creation and history retrieval are performed through REST routes.
 * Real-time message delivery is handled separately by ChatsGateway.
 */
@Controller('lobbies/:code/messages')
@UseGuards(AuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  /**
   * @brief Retrieves the message history of a lobby.
   *
   * The authenticated user must currently belong to the lobby.
   *
   * @param user The authenticated user's JWT payload.
   * @param code The lobby code.
   * @return The lobby messages ordered from oldest to newest.
   */
  @Get()
  findLobbyMessages(
    @CurrentUser() user: JwtPayload,
    @Param('code') code: string,
  ) {
    return this.chatsService.findLobbyMessages(code, user.sub);
  }

  /**
   * @brief Creates a message in a lobby chat.
   *
   * The message is persisted before being broadcast to connected lobby members.
   *
   * @param user The authenticated user's JWT payload.
   * @param code The lobby code.
   * @param createMessageDto The validated message content.
   * @return The newly created message.
   */
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
