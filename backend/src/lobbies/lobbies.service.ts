import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { publicLobbySelect } from './lobbies.select';

// TODO: Avoid duplicate codes
function generateLobbyCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

@Injectable()
export class LobbiesService {
  constructor(private readonly prisma: PrismaService) {}

  async createLobby(data?: { private?: boolean; password?: string }) {
    return this.prisma.lobby.create({
      data: {
        code: generateLobbyCode(),
        private: data?.private ?? false,
        password: data?.password,
        chat: {
          create: {},
        },
      },
      select: publicLobbySelect,
    });
  }

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

  async findLobbyByCode(code: string) {
    const lobby = await this.prisma.lobby.findUnique({
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

  async joinLobby(lobbyCode: string, userId: string) {
    // findLobbyByCode already returns 404 on fail
    const lobby = await this.findLobbyByCode(lobbyCode);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lobbyId: lobby.id,
      },
    });

    return this.findLobbyByCode(lobbyCode);
  }

  async leaveLobby(userId: string) {
    const user = await this.prisma.user.findUnique({
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

    const lobbyId = user.lobbyId;

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lobbyId: null,
      },
    });

    if (lobbyId) {
      const usersLeft = await this.prisma.user.count({
        where: {
          lobbyId,
        },
      });

      if (usersLeft === 0) {
        await this.prisma.lobby.update({
          where: {
            id: lobbyId,
          },
          data: {
            active: false,
          },
        });
      }
    }

    return {
      success: true,
    };
  }
}
