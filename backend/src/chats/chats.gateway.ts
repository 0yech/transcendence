import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

type AuthenticatedSocket = Socket & {
  data: {
    userId?: string;
  };
};

@WebSocketGateway({
  namespace: '/chats',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatsGateway {
  @WebSocketServer()
  private server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    const token = this.extractToken(client);

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
      }>(token);

      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('lobby:join')
  async joinLobby(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { code: string },
  ) {
    const userId = client.data.userId;

    if (!userId) {
      throw new WsException('Unauthorized');
    }

    const lobby = await this.prisma.lobby.findFirst({
      where: {
        code: body.code,
        active: true,
        users: {
          some: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
        code: true,
      },
    });

    if (!lobby) {
      throw new WsException('You are not part of this lobby');
    }

    await client.join(this.getLobbyRoom(lobby.id));

    return {
      success: true,
      lobbyCode: lobby.code,
    };
  }

  @SubscribeMessage('lobby:leave')
  async leaveLobby(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { lobbyId: string },
  ) {
    await client.leave(this.getLobbyRoom(body.lobbyId));

    return {
      success: true,
    };
  }

  emitMessageCreated(lobbyId: string, message: unknown) {
    this.server.to(this.getLobbyRoom(lobbyId)).emit('message:created', message);
  }

  private getLobbyRoom(lobbyId: string) {
    return `lobby:${lobbyId}`;
  }

  private extractToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.token;

    if (typeof authToken === 'string') {
      return authToken.replace(/^Bearer\s+/i, '');
    }

    const authorization = client.handshake.headers.authorization;

    if (typeof authorization === 'string') {
      const [type, token] = authorization.split(' ');

      if (type === 'Bearer' && token) {
        return token;
      }
    }

    const cookies = client.handshake.headers.cookie;

    if (!cookies) {
      return undefined;
    }

    const accessTokenCookie = cookies
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith('access_token='));

    if (!accessTokenCookie) {
      return undefined;
    }

    return decodeURIComponent(
      accessTokenCookie.substring('access_token='.length),
    );
  }
}
