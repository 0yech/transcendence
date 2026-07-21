import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatsGateway } from './chats.gateway';

@Injectable()
export class ChatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatsGateway: ChatsGateway,
  ) {}

  /**
   * @brief Retrieves the message history of a lobby.
   *
   * The authenticated user must currently belong to the lobby.
   *
   * @param lobbyCode The lobby code.
   * @param userId The authenticated user's id.
   * @return The lobby messages ordered from oldest to newest.
   */
  async findLobbyMessages(lobbyCode: string, userId: string) {
    const lobby = await this.findLobbyForMember(lobbyCode, userId);

    return this.prisma.message.findMany({
      where: {
        chatId: lobby.chatId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * @brief Creates a message in a lobby chat.
   *
   * The authenticated user must currently belong to the lobby.
   * The message is persisted before being broadcast through WebSocket.
   *
   * @param lobbyCode The lobby code.
   * @param userId The authenticated user's id.
   * @param content The message content.
   * @return The newly created message.
   */
  async createLobbyMessage(lobbyCode: string, userId: string, content: string) {
    const normalizedContent = content.trim();

    if (normalizedContent.length === 0) {
      throw new BadRequestException('Message content cannot be empty');
    }

    const lobby = await this.findLobbyForMember(lobbyCode, userId);

    const message = await this.prisma.message.create({
      data: {
        content: normalizedContent,
        authorId: userId,
        chatId: lobby.chatId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.chatsGateway.emitMessageCreated(lobby.id, message);

    return message;
  }

  /**
   * @brief Retrieves an active lobby and verifies that the user belongs to it.
   *
   * @param lobbyCode The lobby code.
   * @param userId The authenticated user's id.
   * @return The lobby id and chat id.
   */
  private async findLobbyForMember(
    lobbyCode: string,
    userId: string,
  ): Promise<{
    id: string;
    chatId: string;
  }> {
    const lobby = await this.prisma.lobby.findFirst({
      where: {
        code: lobbyCode,
        active: true,
      },
      select: {
        id: true,
        chat: {
          select: {
            id: true,
          },
        },
        users: {
          where: {
            id: userId,
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!lobby) {
      throw new NotFoundException(`Lobby with code ${lobbyCode} not found`);
    }

    if (lobby.users.length === 0) {
      throw new ForbiddenException('You are not part of this lobby');
    }

    if (!lobby.chat) {
      throw new NotFoundException(`Chat for lobby ${lobbyCode} not found`);
    }

    return {
      id: lobby.id,
      chatId: lobby.chat.id,
    };
  }
}
