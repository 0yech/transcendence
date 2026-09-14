import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
// import { PresenceService } from './presence.service';
import { JwtPayload } from 'src/auth/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

type PresenceSocket = Socket & {
  data: {
    user?: JwtPayload;
  };
};

@WebSocketGateway({
  namespace: '/presence',
})
export class PresenceGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server!: Server;

  constructor(
    // private readonly presenceService: PresenceService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: PresenceSocket) {
    const token = this.getCookie(
      client.handshake.headers.cookie,
      'access_token',
    );

    if (!token) {
      client.emit('game:error', {
        message: 'Unauthorized',
      });

      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      client.data.user = payload;
    } catch {
      client.emit('game:error', {
        message: 'Unauthorized',
      });

      client.disconnect();
    }

    console.log(client.data.user.sub);
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
