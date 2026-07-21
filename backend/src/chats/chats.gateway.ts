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

/**
 * @brief Represents a Socket.IO client with authenticated user data.
 *
 * The user id is stored in socket. data after the JWT has been verified
 * during the connection handshake.
 */
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
/**
 * @brief Handles authenticated real-time communication for lobby chats.
 *
 * The gateway listens on the /chats namespace and uses Socket.IO rooms
 * to broadcast events only to clients connected to a specific lobby.
 *
 * Messages are created through the REST API. This gateway is responsible
 * only for socket authentication, room membership and message broadcasts.
 */
export class ChatsGateway {
  /**
   * Socket.IO server instance injected by NestJS.
   *
   * It is used to broadcast events to all sockets joined to a lobby room.
   */
  @WebSocketServer()
  private server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * @brief Authenticates a newly connected WebSocket client.
   *
   * The JWT is extracted from the Socket.IO handshake and verified once
   * when the connection is established. The authenticated user id is then
   * stored in client.data for use by subsequent WebSocket events.
   *
   * The client is disconnected when the token is missing or invalid.
   *
   * @param client The newly connected Socket.IO client.
   */
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

      /*
       * Store the authenticated user id on this socket connection so that
       * future event handlers do not need to verify the JWT again.
       */
      client.data.userId = payload.sub;
    } catch {
      client.disconnect();
    }
  }

  /**
   * @brief Adds an authenticated socket to a lobby room.
   *
   * The gateway verifies that the user currently belongs to the active
   * lobby before allowing the socket to join its Socket.IO room.
   *
   * Joining the room allows the client to receive message:created events
   * broadcast for this lobby.
   *
   * @param client The authenticated Socket.IO client.
   * @param body The lobby code sent by the client.
   * @return A success acknowledgement containing the lobby code.
   *
   * @throws WsException If the socket is not authenticated.
   * @throws WsException If the user does not belong to the lobby.
   */
  @SubscribeMessage('lobby:join')
  async joinLobby(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { code: string },
  ) {
    const userId = client.data.userId;

    if (!userId) {
      throw new WsException('Unauthorized');
    }

    /*
     * Verify lobby membership from the database instead of trusting
     * the lobby code provided by the client.
     */
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

    /*
     * A Socket.IO room groups all active socket connections associated
     * with the same lobby.
     */
    await client.join(this.getLobbyRoom(lobby.id));

    return {
      success: true,
      lobbyCode: lobby.code,
    };
  }

  /**
   * @brief Removes a socket from a lobby room.
   *
   * This only stops real-time events for the current socket connection.
   * It does not remove the user from the lobby in the database.
   *
   * @param client The connected Socket.IO client.
   * @param body The internal lobby id used to identify the room.
   * @return A success acknowledgement.
   */
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

  /**
   * @brief Broadcasts a newly created message to a lobby room.
   *
   * Every socket that previously joined the lobby room receives
   * the message:created event.
   *
   * This method is called by ChatsService after the message passed
   * tests and has been successfully persisted in the database.
   *
   * @param lobbyId The internal id of the lobby.
   * @param message The persisted message to broadcast.
   * @return Nothing.
   */
  emitMessageCreated(lobbyId: string, message: unknown) {
    this.server.to(this.getLobbyRoom(lobbyId)).emit('message:created', message);
  }

  /**
   * @brief Builds the Socket.IO room name associated with a lobby.
   *
   * @param lobbyId The internal id of the lobby.
   * @return The lobby room name.
   */
  private getLobbyRoom(lobbyId: string) {
    return `lobby:${lobbyId}`;
  }

  /**
   * @brief Extracts the JWT from a Socket.IO connection handshake.
   *
   * The token may be provided through:
   * - handshake authentication data;
   * - the Authorization header;
   * - the access_token cookie.
   *
   * @param client The connecting Socket.IO client.
   * @return The extracted JWT, or undefined when no token is available.
   */
  private extractToken(client: Socket): string | undefined {
    /*
     * Socket.IO clients may explicitly provide the token through
     * the auth object when opening the connection.
     */
    const authToken = client.handshake.auth?.token;

    if (typeof authToken === 'string') {
      return authToken.replace(/^Bearer\s+/i, '');
    }

    /*
     * Non-browser clients may provide the token through a standard
     * Authorization: Bearer header.
     */
    const authorization = client.handshake.headers.authorization;

    if (typeof authorization === 'string') {
      const [type, token] = authorization.split(' ');

      if (type === 'Bearer' && token) {
        return token;
      }
    }

    /*
     * Browser clients may reuse the access_token cookie already used
     * to authenticate protected HTTP routes.
     */
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
