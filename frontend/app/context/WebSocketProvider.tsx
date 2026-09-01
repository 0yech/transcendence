import { useEffect, useRef, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { WebsocketContext } from './WebSocketContext';
import { useNavigate } from 'react-router';
import apiFetch from '~/utils/api-fetch';
import type { InterfaceGameState } from './WebSocketContext';

/**
 *
 * @brief function that create the context api. Used to wrap everything to get access to desired function if needed
 *
 * @param children children's node. will execute it to display it
 *
 * @returns a collection of function that will be used. read inside function for informations
 *
 */
export function WebSocketRef({ children }: { children: ReactNode }) {
  const wsRef = useRef<Socket | null>(null);
  const codeLink = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const gameNavigationDoneRef = useRef<boolean>(false);
  const [useGameState, setGameState] = useState<InterfaceGameState | null>(
    null,
  );
  const navigate = useNavigate();

  /**
   *
   * @brief handle the first connection to a server. start listening on game:state.
   * @brief if it's user's turn or first turn everybody get "teported" to the right route '/game/:code/play'
   * @brief start all the listens (game:state, game:error, connect, disconnect)
   *
   * @returns a promise that resolves if the connection succeeds and rejects if it fails
   */
  const connect = useCallback(
    (code: string): Promise<boolean> => {
      return new Promise((resolve, reject) => {
        /*
         * Already connected to this lobby.
         */
        if (wsRef.current?.connected && codeLink.current === code) {
          resolve(true);
          return;
        }

        /*
         * Clean previous game socket BEFORE creating the new one.
         */
        if (wsRef.current) {
          wsRef.current.removeAllListeners();
          wsRef.current.disconnect();
          wsRef.current = null;
        }

        codeLink.current = code;
        gameNavigationDoneRef.current = false;
        setGameState(null);

        const socket = io('/games', {
          reconnection: true,
          withCredentials: true,
          autoConnect: false,
        });

        wsRef.current = socket;

        let settled = false;

        const timeout = setTimeout(() => {
          if (settled) {
            return;
          }

          settled = true;

          socket.disconnect();

          if (wsRef.current === socket) {
            wsRef.current = null;
          }

          reject(new Error('game:join timeout after 5s'));
        }, 5000);

        const rejectConnection = (message: string) => {
          if (settled) {
            return;
          }

          settled = true;
          clearTimeout(timeout);
          reject(new Error(message));
        };

        /*
         * register game:state BEFORE game:join because the backend
         * can emit game:state while handling game:join.
         */
        socket.on('game:state', (e) => {
          console.log('game:state', e);

          setGameState(e);

          if (!gameNavigationDoneRef.current && e.turnNumber === 1) {
            gameNavigationDoneRef.current = true;
            navigate(`/game/${code}/play`);
          }
        });

        socket.on('game:error', (e) => {
          console.error('game:error', e);

          const message =
            typeof e?.message === 'string' ? e.message : 'Game websocket error';

          rejectConnection(message);
        });

        /*
         * NestJS WsException can arrive on "exception".
         * more useful instead of silently waiting for the ACK timeout.
         */
        socket.on('exception', (e) => {
          console.error('game websocket exception', e);

          let message = 'Game websocket exception';

          if (typeof e === 'string') {
            message = e;
          } else if (typeof e?.message === 'string') {
            message = e.message;
          } else if (typeof e?.error === 'string') {
            message = e.error;
          }

          rejectConnection(message);
        });

        socket.on('connect_error', (error) => {
          console.error('game websocket connect_error', error);

          rejectConnection(
            error instanceof Error
              ? error.message
              : 'Could not connect to game websocket',
          );
        });

        socket.on('disconnect', (reason) => {
          console.log('game websocket disconnected:', reason);
        });

        /*
         * wait until Socket.IO is actually connected before game:join.
         */
        socket.on('connect', () => {
          console.log('connected to /games websocket');

          socket.emit(
            'game:join',
            {
              lobbyCode: code,
            },
            (
              ack: {
                ok?: boolean;
                success?: boolean;
                lobbyCode?: string;
              } | null,
            ) => {
              console.log('game:join ack', ack);

              if (settled) {
                return;
              }

              if (!ack || (ack.ok !== true && ack.success !== true)) {
                rejectConnection('game:join rejected');
                return;
              }

              settled = true;
              clearTimeout(timeout);

              resolve(true);
            },
          );
        });

        /*
         * Start connection only after ALL listeners are registered.
         */
        socket.connect();
      });
    },
    [navigate],
  );

  useEffect(() => {
    async function initialize() {
      try {
        const authResponse = await apiFetch('/api/auth/me');
        const user = await authResponse.json();

        userIdRef.current = user.id;
        const lobbyResponse = await apiFetch('/api/lobbies/me');
        if (!lobbyResponse.ok) {
          return;
        }
        const lobby = await lobbyResponse.json();
        if (lobby?.code) {
          await connect(lobby.code);
        }
      } catch (error) {
        console.error('Failed to restore websocket connection:', error);
      }
    }

    initialize();
  }, [connect]);

  /**
   *
   * @brief handle the playing of card by slot number
   *
   * @async @returns create the new Promise<boolean> for the return or a throw if fails
   *
   */
  function playCard(slot: number): Promise<boolean> {
    return new Promise((resolve) => {
      if (!wsRef.current || !codeLink.current)
        throw new Error('No active game. cannot play a card');
      wsRef.current.timeout(2000).emit(
        'game:play-slot',
        {
          lobbyCode: codeLink.current,
          slot: slot,
        },
        () => {
          console.log('played slot ' + slot);
          return resolve(true);
        },
      );
    });
  }

  /**
   *
   * @brief handle the playing of the four cards (must all be ONO99)
   *
   * @async @returns create the new Promise<boolean> for the return or a throw if fails
   *
   */
  function playFour(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!wsRef.current || !codeLink.current)
        throw new Error('No active game. cannot play a card');
      wsRef.current.timeout(2000).emit(
        'game:discard-four-ono99',
        {
          lobbyCode: codeLink.current,
        },
        () => {
          console.log('played all 4 ONO');
          return resolve(true);
        },
      );
    });
  }

  /**
   *
   * @brief handle declaring forfeit
   *
   * @async @returns create the new Promise<boolean> for the return or a throw if fails
   *
   */
  function unable(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!wsRef.current || !codeLink.current)
        throw new Error('No active game. cannot play a card');
      wsRef.current.timeout(2000).emit(
        'game:unable',
        {
          lobbyCode: codeLink.current,
        },
        () => {
          console.log('declared forfeit');
          return resolve(true);
        },
      );
    });
  }
  /**
   *
   * @brief handle the emitting of the start of the game
   *
   * @async @returns create the new Promise<boolean> for the return or a throw if fails
   *
   */
  function gameStart(): Promise<boolean> {
    return new Promise((resolve) => {
      if (!wsRef.current)
        throw new Error('No active game. cannot start a game (wsRef)');
      if (!codeLink.current)
        throw new Error('No active game. cannot start a game (codeLink)');
      wsRef.current.timeout(2000).emit(
        'game:start',
        {
          lobbyCode: codeLink.current,
        },
        () => resolve(true),
      );
    });
  }

  /**
   *
   * @brief handle the disconnect of a game
   * @brief remove every possible game link (websocket, code, if game started or not. reset gameState)
   *
   */
  function disconnect() {
    if (wsRef.current) {
      wsRef.current.removeAllListeners();
      wsRef.current.disconnect();
      wsRef.current = null;
    }

    codeLink.current = null;
    gameNavigationDoneRef.current = false;
    setGameState(null);
  }

  /**
   *
   * @brief collection of useful function such as check easily if connected to a ws, if game started or the id
   *
   */
  function isConnected(): string | null {
    return codeLink.current;
  }

  function gameStarted(): boolean {
    return useGameState?.status === 'IN_PROGRESS';
  }

  function userId(): string | null {
    return userIdRef.current;
  }

  function setUserId(id: string): void {
    userIdRef.current = id;
  }

  return (
    <WebsocketContext
      value={{
        connect: connect,
        disconnect: disconnect,
        startGame: gameStart,
        playSlot: playCard,
        playFour: playFour,
        unable: unable,
        isConnected: isConnected,
        gameStarted: gameStarted,
        userId: userId,
        setUserId: setUserId,
        gameState: useGameState,
      }}
    >
      {children}
    </WebsocketContext>
  );
}
