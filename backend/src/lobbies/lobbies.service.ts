import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
      include: {
        chat: true,
        users: true,
      },
    });
  }

  async findActiveLobbies() {
    return this.prisma.lobby.findMany({
      where: {
        active: true,
      },
      include: {
        users: true,
        chat: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findLobbyByCode(code: string) {
    const lobby = await this.prisma.lobby.findUnique({
      where: {
        code,
      },
      include: {
        users: true,
        chat: true,
      },
    });

    if (!lobby) {
      throw new NotFoundException(`Lobby with code ${code} not found`);
    }

    return lobby;
  }

  async joinLobby(lobbyCode: string, userId: string) {
    // findLobbyByCode already returns 404 on fail
    const lobby = await this.findLobbyByCode(lobbyCode);

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lobbyId: lobby.id,
      },
      include: {
        lobby: true,
      },
    });
  }

  async leaveLobby(userId: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lobbyId: null,
      },
    });
  }
}
