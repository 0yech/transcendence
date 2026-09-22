import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
} from '@nestjs/websockets';
import { DefaultEventsMap, Socket } from 'socket.io';
import { PresenceService } from './presence.service';
import { JwtPayload } from 'src/auth/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

type PresenceSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  { user?: JwtPayload }
>;

/**
 * socket.io gateway used to communicate online status changes between users.
 */
@WebSocketGateway({
  namespace: '/presence',
})
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly presenceService: PresenceService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Verifies the authentication of the user, and then joins a room for the user.
   * This room will be available to other users to notify the current user of
   * online status changes.
   */
  async handleConnection(client: PresenceSocket) {
    const token = this.getCookie(
      client.handshake.headers.cookie,
      'access_token',
    );

    if (!token) {
      client.emit('presence:error', {
        message: 'Unauthorized',
      });

      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      client.data.user = payload;
    } catch {
      client.emit('presence:error', {
        message: 'Unauthorized',
      });

      client.disconnect();
      return;
    }

    const userId = client.data.user.sub;

    const friendRelations = await this.prismaService.friendRelation.findMany({
      where: { userId: userId },
    });

    // Recheck socket status after await
    if (!client.connected) {
      return;
    }

    if (this.presenceService.addSocket(userId, client.id)) {
      friendRelations.forEach((friendRelation) => {
        client
          .to(friendRelation.friendId)
          .emit('presence:online', { userId: userId });
      });
    }

    const onlineFriends = friendRelations
      .filter((relation) => this.presenceService.isOnline(relation.friendId))
      .map((row) => row.friendId);
    client.emit('presence:sync', { onlineFriends: onlineFriends });

    client.join(userId);
  }

  async handleDisconnect(client: PresenceSocket) {
    // Socket gets disconnected if handleConnection didn't connect it to begin with
    // which would mean client.data.user is undefined
    if (client.data.user) {
      if (this.presenceService.removeSocket(client.data.user.sub, client.id)) {
        const friendRelations =
          await this.prismaService.friendRelation.findMany({
            where: { userId: client.data.user.sub },
          });

        friendRelations.forEach((friendRelation) => {
          client
            .to(friendRelation.friendId)
            .emit('presence:offline', { userId: client.data.user?.sub });
        });
      }
    }
  }

  /**
   * @brief Reads a cookie from the WebSocket handshake.
   *
   * @param cookieHeader Raw Cookie header.
   * @param name Cookie name.
   * @returns Cookie value if found.
   */
  private getCookie(cookieHeader: string | undefined, name: string) {
    if (!cookieHeader) {
      return undefined;
    }

    const cookies = cookieHeader.split(';');

    for (const cookie of cookies) {
      const [rawName, ...rawValue] = cookie.trim().split('=');

      if (rawName !== name) {
        continue;
      }

      const value = rawValue.join('=');

      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }

    return undefined;
  }
}
