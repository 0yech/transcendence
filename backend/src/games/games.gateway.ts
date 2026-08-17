import { HttpException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { GamesService } from './games.service';

type GameSocket = Socket & {
  data: {
    user?: JwtPayload;
  };
};

type GameState = {
  id: string;
  players: Array<{
    userId: string;
  }>;
};

/**
 * @brief WebSocket gateway responsible for realtime game interactions.
 *
 * Handles authentication, lobby rooms, game actions and personalized
 * game state broadcasts.
 */
@WebSocketGateway({
  namespace: '/games',
})
export class GamesGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server!: Server;

  constructor(
    private readonly gamesService: GamesService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * @brief Authenticates a new WebSocket connection.
   *
   * Uses the same access_token cookie as the HTTP API.
   *
   * @param client Connected Socket.IO client.
   */
  async handleConnection(client: GameSocket) {
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
  }

  /**
   * @brief Joins the room associated with a game lobby.
   *
   * A player can join before the game starts so they receive
   * the initial game state once it is created.
   *
   * @param client Connected Socket.IO client.
   * @param body Payload containing the lobby code.
   * @returns Acknowledgement containing the normalized lobby code.
   */
  @SubscribeMessage('game:join')
  async joinGame(
    @ConnectedSocket() client: GameSocket,
    @MessageBody()
    body: {
      lobbyCode: string;
    },
  ) {
    return this.handleError(async () => {
      const user = this.getUser(client);
      const lobbyCode = this.normalizeLobbyCode(body.lobbyCode);

      await this.gamesService.assertLobbyAccess(lobbyCode, user.sub);

      await client.join(this.getRoomName(lobbyCode));

      try {
        const game = await this.gamesService.getGame(lobbyCode, user.sub);

        client.emit('game:state', game);
      } catch (error) {
        /*
         * No active game is valid here.
         * The player may join the room before the game starts.
         */
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }

      return {
        ok: true,
        lobbyCode,
      };
    });
  }

  /**
   * @brief Starts a game from an existing lobby.
   *
   * @param client Connected Socket.IO client.
   * @param body Payload containing the lobby code.
   * @returns Action acknowledgement.
   */
  @SubscribeMessage('game:start')
  async startGame(
    @ConnectedSocket() client: GameSocket,
    @MessageBody()
    body: {
      lobbyCode: string;
    },
  ) {
    return this.runGameAction(client, body.lobbyCode, (lobbyCode, userId) =>
      this.gamesService.startFromLobby(lobbyCode, userId),
    );
  }

  /**
   * @brief Plays a card using its exact card ID.
   *
   * @param client Connected Socket.IO client.
   * @param body Payload containing the lobby code and card ID.
   * @returns Action acknowledgement.
   */
  @SubscribeMessage('game:play-card')
  async playCard(
    @ConnectedSocket() client: GameSocket,
    @MessageBody()
    body: {
      lobbyCode: string;
      cardId: string;
    },
  ) {
    return this.runGameAction(client, body.lobbyCode, (lobbyCode, userId) =>
      this.gamesService.playCard(lobbyCode, userId, body.cardId),
    );
  }

  /**
   * @brief Plays a card using its position in the player's hand. (preferred)
   *
   * slot = 1 means first card in hand.
   * slot = 2 means second card in hand.
   * etc.
   *
   * @param client Connected Socket.IO client.
   * @param body Payload containing the lobby code and hand slot.
   * @returns Action acknowledgement.
   */
  @SubscribeMessage('game:play-slot')
  async playSlot(
    @ConnectedSocket() client: GameSocket,
    @MessageBody()
    body: {
      lobbyCode: string;
      slot: number;
    },
  ) {
    return this.runGameAction(client, body.lobbyCode, (lobbyCode, userId) =>
      this.gamesService.playSlot(lobbyCode, userId, body.slot),
    );
  }

  /**
   * @brief Declares that the current player cannot play.
   *
   * @param client Connected Socket.IO client.
   * @param body Payload containing the lobby code.
   * @returns Action acknowledgement.
   */
  @SubscribeMessage('game:unable')
  async unableToPlay(
    @ConnectedSocket() client: GameSocket,
    @MessageBody()
    body: {
      lobbyCode: string;
    },
  ) {
    return this.runGameAction(client, body.lobbyCode, (lobbyCode, userId) =>
      this.gamesService.unableToPlay(lobbyCode, userId),
    );
  }

  /**
   * @brief Performs the four-card ONO99 discard action.
   *
   * @param client Connected Socket.IO client.
   * @param body Payload containing the lobby code.
   * @returns Action acknowledgement.
   */
  @SubscribeMessage('game:discard-four-ono99')
  async discardFourOno99(
    @ConnectedSocket() client: GameSocket,
    @MessageBody()
    body: {
      lobbyCode: string;
    },
  ) {
    return this.runGameAction(client, body.lobbyCode, (lobbyCode, userId) =>
      this.gamesService.discardFourOno99(lobbyCode, userId),
    );
  }

  /**
   * @brief Executes a game action and broadcasts the updated state.
   *
   * @param client Socket.IO client performing the action.
   * @param rawLobbyCode Lobby code received from the client.
   * @param action Service action to execute.
   * @returns Action acknowledgement.
   */
  private async runGameAction(
    client: GameSocket,
    rawLobbyCode: string,
    action: (lobbyCode: string, userId: string) => Promise<GameState>,
  ) {
    return this.handleError(async () => {
      const user = this.getUser(client);
      const lobbyCode = this.normalizeLobbyCode(rawLobbyCode);

      const game = await action(lobbyCode, user.sub);

      await this.broadcastGameState(lobbyCode, game);

      return {
        ok: true,
      };
    });
  }

  /**
   * @brief Broadcasts a personalized game state to each player.
   *
   * Each state is generated separately so players only receive
   * their own hand.
   *
   * @param lobbyCode Lobby code associated with the game room.
   * @param game Updated game state.
   */
  private async broadcastGameState(lobbyCode: string, game: GameState) {
    const roomName = this.getRoomName(lobbyCode);

    const sockets = await this.server.in(roomName).fetchSockets();

    const playerIds = new Set(game.players.map((player) => player.userId));

    await Promise.all(
      sockets.map(async (socket) => {
        const userId = socket.data.user?.sub;

        if (!userId) {
          return;
        }

        if (!playerIds.has(userId)) {
          return;
        }

        const state = await this.gamesService.getGameById(game.id, userId);

        socket.emit('game:state', state);
      }),
    );
  }

  /**
   * @brief Returns the authenticated user attached to a socket.
   *
   * @param client Connected Socket.IO client.
   * @returns Authenticated JWT payload.
   * @throws WsException If the socket is not authenticated.
   */
  private getUser(client: GameSocket): JwtPayload {
    const user = client.data.user;

    if (!user) {
      throw new WsException('Unauthorized');
    }

    return user;
  }

  /**
   * @brief Normalizes a lobby code.
   *
   * @param lobbyCode Raw lobby code.
   * @returns Trimmed uppercase lobby code.
   * @throws WsException If the lobby code is invalid.
   */
  private normalizeLobbyCode(lobbyCode: string): string {
    if (typeof lobbyCode !== 'string' || !lobbyCode.trim()) {
      throw new WsException('lobbyCode is required');
    }

    return lobbyCode.trim().toUpperCase();
  }

  /**
   * @brief Builds the Socket.IO room name for a lobby.
   *
   * @param lobbyCode Normalized lobby code.
   * @returns Socket.IO room name.
   */
  private getRoomName(lobbyCode: string) {
    return `game:${lobbyCode}`;
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

  /**
   * @brief Converts service exceptions into WebSocket exceptions.
   *
   * @param callback Asynchronous operation to execute.
   * @returns Result returned by the callback.
   * @throws WsException When the operation fails.
   */
  private async handleError<T>(callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (error) {
      if (error instanceof WsException) {
        throw error;
      }

      if (error instanceof HttpException) {
        throw new WsException(error.getResponse());
      }

      throw new WsException('Internal server error');
    }
  }
}
