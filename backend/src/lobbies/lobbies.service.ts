import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatsGateway } from '../chats/chats.gateway';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { publicLobbySelect } from './lobbies.select';
import { Interval } from '@nestjs/schedule';

const lobbyInactivityMs = 15 * 60 * 1000;

function generateLobbyCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/**
 * @brief Handles routes related to lobbies.
 *
 * Includes endpoints to create, list, retrieve, join and leave lobbies.
 * Routes that modify a user's lobby state (create/join/leave) require a JWT.
 */
@Injectable()
export class LobbiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chatsGateway: ChatsGateway,
  ) {}

  /**
   * @brief Finds active lobbies that have had no game activity
   * for at least 15 minutes.
   *
   * A lobby is considered inactive when:
   * - it is at least 15 minutes old;
   * - it has no game currently in progress;
   * - no game has started or finished during the last 15 minutes.
   *
   * @return The ids of lobbies eligible for expiration.
   */
  private async findInactiveLobbies() {
    const inactivityLimit = new Date(Date.now() - lobbyInactivityMs);

    return this.prisma.lobby.findMany({
      where: {
        active: true,
        createdAt: {
          lte: inactivityLimit,
        },
        games: {
          none: {
            OR: [
              {
                status: 'IN_PROGRESS',
              },
              {
                startedAt: {
                  gt: inactivityLimit,
                },
              },
              {
                finishedAt: {
                  gt: inactivityLimit,
                },
              },
            ],
          },
        },
      },

      select: {
        id: true,
        code: true,
      },
    });
  }

  /**
   * @brief Marks a lobby as inactive and removes all users from it.
   *
   * @param lobbyId The lobby to deactivate.
   */
  private async deactivateLobby(lobbyId: string) {
    await this.prisma.$transaction(async (tx) => {
      await tx.user.updateMany({
        where: {
          lobbyId,
        },
        data: {
          lobbyId: null,
        },
      });

      await tx.lobby.update({
        where: {
          id: lobbyId,
        },
        data: {
          active: false,
          leaderId: null,
        },
      });
    });
  }

  /**
   * @brief Expires lobbies that have had no game activity
   * for at least 15 minutes.
   *
   * The check runs once per minute.
   */
  @Interval(60_000)
  async cleanupInactiveLobbies() {
    const inactiveLobbies = await this.findInactiveLobbies();

    for (const lobby of inactiveLobbies) {
      await this.deactivateLobby(lobby.id);
    }
  }

  /**
   * @brief Creates a short code that has no active dupe.
   *
   * @return The lobby code.
   */
  private async generateUniqueLobbyCode(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    for (let i = 0; i < 10; i++) {
      const code = generateLobbyCode();

      const existingActiveLobby = await tx.lobby.findFirst({
        where: {
          code,
          active: true,
        },
        select: {
          id: true,
        },
      });

      if (!existingActiveLobby) {
        return code;
      }
    }

    throw new Error('Could not generate a unique active lobby code');
  }

  private async updateLobbyAfterLeave(
    tx: Prisma.TransactionClient,
    lobbyId?: string | null,
  ) {
    if (!lobbyId) {
      return;
    }

    const lobby = await tx.lobby.findUnique({
      where: { id: lobbyId },
      select: {
        leaderId: true,
        users: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!lobby) {
      return;
    }

    if (lobby.users.length === 0) {
      await tx.lobby.update({
        where: { id: lobbyId },
        data: {
          active: false,
          leaderId: null,
        },
      });

      return;
    }

    const leaderStillHere = lobby.users.some(
      (user) => user.id === lobby.leaderId,
    );

    if (!leaderStillHere) {
      await tx.lobby.update({
        where: { id: lobbyId },
        data: {
          leaderId: lobby.users[0].id,
        },
      });
    }
  }

  /**
   * @brief Creates a new lobby and adds the user in it.
   *
   * @param user The user's JWT payload.
   * @return The newly created lobby.
   */
  async createLobby(userId: string, data?: { private?: boolean }) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          lobbyId: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      const previousLobbyId = user.lobbyId;
      const code = await this.generateUniqueLobbyCode(tx);

      const lobby = await tx.lobby.create({
        data: {
          code,
          private: data?.private ?? false,
          leaderId: userId,
          chat: {
            create: {},
          },
          users: {
            connect: {
              id: userId,
            },
          },
        },
        select: publicLobbySelect,
      });

      await this.updateLobbyAfterLeave(tx, previousLobbyId);

      return lobby;
    });
  }

  /**
   * @brief Retrieves currently active lobbies.
   *
   * @return A list of active lobbies.
   */
  async findActiveLobbies() {
    return this.prisma.lobby.findMany({
      where: {
        active: true,
        private: false,
      },
      select: publicLobbySelect,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * @brief Retrieves an active lobby by its code.
   *
   * @return Matching active lobby.
   */
  async findLobbyByCode(code: string) {
    const lobby = await this.prisma.lobby.findFirst({
      where: {
        code,
        active: true,
      },
      select: publicLobbySelect,
    });

    if (!lobby) {
      throw new NotFoundException(`Lobby with code ${code} not found`);
    }

    return lobby;
  }

  /**
   * @brief Retrieves the lobby of an authenticated user
   *
   * @return Matching active lobby.
   */
  async findCurrentLobby(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        lobby: {
          select: publicLobbySelect,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    return user.lobby ?? {};
  }

  /**
   * @brief Adds an authenticated user to a lobby.
   *
   * @param user The user's JWT payload.
   * @param code The code of the lobby to join.
   * @return The lobby joined by the authenticated user.
   */
  async joinLobby(lobbyCode: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const lobby = await tx.lobby.findFirst({
        where: {
          code: lobbyCode,
          active: true,
        },
        select: {
          id: true,
          code: true,
          private: true,
        },
      });

      if (!lobby) {
        throw new NotFoundException(`Lobby with code ${lobbyCode} not found`);
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          lobbyId: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      if (user.lobbyId !== lobby.id) {
        const previousLobbyId = user.lobbyId;

        await tx.user.update({
          where: {
            id: userId,
          },
          data: {
            lobbyId: lobby.id,
          },
        });

        await this.updateLobbyAfterLeave(tx, previousLobbyId);
      }

      return tx.lobby.findUniqueOrThrow({
        where: {
          id: lobby.id,
        },
        select: publicLobbySelect,
      });
    });
  }

  async kickMember(actorId: string, memberId: string) {
    if (actorId === memberId) {
      throw new BadRequestException('You cannot kick yourself');
    }

    const lobby = await this.prisma.$transaction(async (tx) => {
      const actor = await tx.user.findUnique({
        where: {
          id: actorId,
        },
        select: {
          lobbyId: true,
        },
      });

      if (!actor) {
        throw new NotFoundException(`User with id ${actorId} not found`);
      }

      if (!actor.lobbyId) {
        throw new BadRequestException('You are not in a lobby');
      }

      const lobby = await tx.lobby.findUnique({
        where: {
          id: actor.lobbyId,
        },
        select: {
          id: true,
          active: true,
          leaderId: true,
        },
      });

      if (!lobby || !lobby.active) {
        throw new NotFoundException('Active lobby not found');
      }

      if (lobby.leaderId !== actorId) {
        throw new ForbiddenException('Only the lobby leader can kick members');
      }

      const member = await tx.user.findUnique({
        where: {
          id: memberId,
        },
        select: {
          lobbyId: true,
        },
      });

      if (!member) {
        throw new NotFoundException(`User with id ${memberId} not found`);
      }

      if (member.lobbyId !== lobby.id) {
        throw new BadRequestException('User is not in your lobby');
      }

      const activeGame = await tx.game.findFirst({
        where: {
          lobbyId: lobby.id,
          status: 'IN_PROGRESS',
        },
        select: {
          id: true,
        },
      });

      if (activeGame) {
        throw new BadRequestException(
          'Cannot kick a member while a game is in progress',
        );
      }

      await tx.user.update({
        where: {
          id: memberId,
        },
        data: {
          lobbyId: null,
        },
      });

      return tx.lobby.findUniqueOrThrow({
        where: {
          id: lobby.id,
        },
        select: publicLobbySelect,
      });
    });

    await this.chatsGateway.disconnectUser(memberId);

    return lobby;
  }
  /**
   * @brief Removes the user from the lobby.
   *
   * @param user The authenticated user's JWT payload.
   * @return A success response once the user has left the lobby.
   */
  async leaveLobby(userId: string) {
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          lobbyId: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      const previousLobbyId = user.lobbyId;

      await tx.user.update({
        where: {
          id: userId,
        },
        data: {
          lobbyId: null,
        },
      });

      await this.updateLobbyAfterLeave(tx, previousLobbyId);
    });

    return {
      success: true,
    };
  }
}
