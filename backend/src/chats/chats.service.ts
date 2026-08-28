import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChatsGateway } from './chats.gateway';
import { publicMessageSelect } from './chats.select';

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
    const lobby = await this.findLobbyForReader(lobbyCode, userId);

    return this.prisma.message.findMany({
      where: {
        chatId: lobby.chatId,
      },
      select: publicMessageSelect,
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
    /*
     * Normalize the content before validation and persistence so that
     * whitespace-only messages cannot be stored.
     */
    const normalizedContent = content.trim();

    if (normalizedContent.length === 0) {
      throw new BadRequestException('Message content cannot be empty');
    }

    const lobby = await this.findLobbyForMember(lobbyCode, userId);

    /*
     * Persist the message before broadcasting it so that clients never
     * receive a message that was not successfully stored.
     */
    const message = await this.prisma.message.create({
      data: {
        content: normalizedContent,
        authorId: userId,
        chatId: lobby.chatId,
      },
      select: publicMessageSelect,
    });

    /*
     * Broadcast the same public message representation returned by
     * the REST endpoint to every socket joined to the lobby room.
     */
    this.chatsGateway.emitMessageCreated(lobby.id, message);

    return message;
  }

  /**
   * @brief Finds a lobby and checks if the user is allowed to read its chat.
   * @brief Public lobbies can be read by any authenticated user.
   * @brief Private lobbies can only be read by lobby members.
   *
   * @returns The lobby id and chat id if access is allowed.
   */
  private async findLobbyForReader(
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
        private: true,
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

    const isMember = lobby.users.length > 0;

    if (lobby.private && !isMember) {
      throw new ForbiddenException('Private lobby chat');
    }

    if (!lobby.chat) {
      throw new NotFoundException(`Chat for lobby ${lobbyCode} not found`);
    }

    return {
      id: lobby.id,
      chatId: lobby.chat.id,
    };
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
