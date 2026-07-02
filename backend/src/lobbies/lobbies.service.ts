import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { publicLobbySelect } from './lobbies.select';

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
  constructor(private readonly prisma: PrismaService) {}

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

  private async deactivateLobbyIfEmpty(
    tx: Prisma.TransactionClient,
    lobbyId?: string | null,
  ) {
    if (!lobbyId) {
      return;
    }

    const usersLeft = await tx.user.count({
      where: { lobbyId },
    });

    if (usersLeft === 0) {
      await tx.lobby.update({
        where: { id: lobbyId },
        data: { active: false },
      });
    }
  }

  /**
   * @brief Creates a new lobby and adds the user in it.
   *
   * @param user The user's JWT payload.
   * @param body Parameters for private/password
   * @return The newly created lobby.
   */
  async createLobby(
    userId: string,
    data?: { private?: boolean; password?: string },
  ) {
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
          password: data?.password,
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

      await this.deactivateLobbyIfEmpty(tx, previousLobbyId);

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
   * @brief Adds an authenticated user to a lobby.
   *
   * @param user The user's JWT payload.
   * @param code The code of the lobby to join.
   * @param body Password if private
   * @return The lobby joined by the authenticated user.
   */
  async joinLobby(lobbyCode: string, userId: string, password?: string) {
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
          password: true,
        },
      });

      if (!lobby) {
        throw new NotFoundException(`Lobby with code ${lobbyCode} not found`);
      }

      if (lobby.private && lobby.password !== password) {
        throw new ForbiddenException('Invalid lobby password');
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

        await this.deactivateLobbyIfEmpty(tx, previousLobbyId);
      }

      return tx.lobby.findUniqueOrThrow({
        where: {
          id: lobby.id,
        },
        select: publicLobbySelect,
      });
    });
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

      await this.deactivateLobbyIfEmpty(tx, previousLobbyId);
    });

    return {
      success: true,
    };
  }
}
