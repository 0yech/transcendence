import { useEffect, useRef, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { WebsocketContext } from './WebSocketContext';
import { useNavigate } from 'react-router';
import apiFetch, { UnauthenticatedError } from '~/utils/api-fetch';
import { getCurrentUser } from '~/utils/users';
import type { InterfaceGameState, SelfUserInterface } from './WebSocketContext';

/**
 *
 * @brief function that create the context api. Used to wrap everything to get access to desired function if needed
 *
 * @param children children's node. will execute it to display it
 *
 * @returns a collection of function that will be used. read inside function for informations
 *
 */
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const wsRef = useRef<Socket | null>(null);
  const codeLink = useRef<string | null>(null);
  const userIdRef = useRef<string | null>(null);
  const userRef = useRef<SelfUserInterface | null>(null);
  const gameNavigationDoneRef = useRef<boolean>(false);
  const [lobbyCode, setLobbyCode] = useState<string | null>(null);
  const pendingConnectionRef = useRef<{
    code: string;
    promise: Promise<boolean>;
  } | null>(null);
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
      if (wsRef.current?.connected && codeLink.current === code) {
        return Promise.resolve(true);
      }

      codeLink.current = code;
      setLobbyCode(code);
      if (pendingConnectionRef.current?.code === code) {
        return pendingConnectionRef.current.promise;
      }
      const promise = new Promise<boolean>((resolve, reject) => {
        /*
         * Clean previous game socket BEFORE creating the new one.
         */
        if (wsRef.current) {
          wsRef.current.removeAllListeners();
          wsRef.current.disconnect();
          wsRef.current = null;
        }

        gameNavigationDoneRef.current = false;
        setGameState(null);

        const socket = io('/games', {
          reconnection: true,
          withCredentials: true,
          autoConnect: false,
        });

        wsRef.current = socket;

        let settled = false;
        let retriedAfterRejection = false;

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

          // A lobby keeps its socket connection between games. Re-arm the
          // navigation guard once a game finishes so the next game's initial
          // state can send everyone back to the play screen.
          if (e.status === 'FINISHED') {
            gameNavigationDoneRef.current = false;
            return;
          }

          if (!gameNavigationDoneRef.current && e.turnNumber === 1) {
            gameNavigationDoneRef.current = true;
            navigate(`/game/${code}/play`);
          }
        });

        socket.on('game:error', (e) => {
          console.log('game:error', e);

          const message =
            typeof e?.message === 'string' ? e.message : 'Game websocket error';

          rejectConnection(message);
        });

        /*
         * NestJS WsException can arrive on "exception".
         * more useful instead of silently waiting for the ACK timeout.
         */
        socket.on('exception', (e) => {
          console.error('[GAME WS] EXCEPTION RAW:', e);
          console.error(
            '[GAME WS] EXCEPTION JSON:',
            JSON.stringify(e, null, 2),
          );

          let message = 'Game websocket exception';

          if (typeof e === 'string') {
            message = e;
          } else if (typeof e?.message === 'string') {
            message = e.message;
          } else if (typeof e?.error === 'string') {
            message = e.error;
          }

          console.error('[GAME WS] EXCEPTION MESSAGE:', message);

          rejectConnection(message);
        });
        socket.on('connect_error', (error) => {
          console.log('game websocket connect_error', error);

          rejectConnection(
            error instanceof Error
              ? error.message
              : 'Could not connect to game websocket',
          );
        });

        /*
         * The gateway only checks the access token when a socket connects, and
         * hangs up on the sockets it rejects. socket.io reconnects on its own
         * after a network drop, possibly with a token that expired meanwhile,
         * but never after being hung up on.
         *
         * A game is played entirely over this socket, so no HTTP request runs
         * meanwhile to refresh the session lazily. Without this, one blip past
         * the access token's lifetime strands the player until they reload,
         * and the server eliminates them on the next turn timeout. So refresh
         * the session once and try again; if the session is gone for good,
         * stay down and let the next navigation redirect to the login page.
         */
        socket.on('disconnect', async (reason) => {
          console.log('game websocket disconnected:', reason);

          if (reason !== 'io server disconnect' || retriedAfterRejection) {
            return;
          }

          retriedAfterRejection = true;
          const user = await getCurrentUser();

          // This socket may have been replaced or torn down while refreshing.
          if (wsRef.current !== socket) {
            return;
          }

          if (!user) {
            return;
          }

          // Someone else logged in while we were away: this socket is stale.
          if (userIdRef.current !== null && user.id !== userIdRef.current) {
            return;
          }

          socket.connect();
        });

        /*
         * wait until Socket.IO is actually connected before game:join.
         */
        socket.on('connect', () => {
          console.log('[GAME WS] CONNECTED:', socket.id);
          console.log('[GAME WS] JOINING LOBBY:', code);
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
              console.log('[GAME WS] JOIN ACK:', ack);

              const accepted = ack?.ok === true || ack?.success === true;

              /*
               * A reconnect runs this handler again, long after the initial
               * promise settled. A rejoin that succeeds proves the refreshed
               * session works, so re-arm the one-shot retry for the next
               * rejection instead of leaving it spent for the socket's life.
               */
              if (accepted) {
                retriedAfterRejection = false;
              }

              if (settled) {
                return;
              }

              if (!accepted) {
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

      pendingConnectionRef.current = {
        code,
        promise,
      };

      promise.finally(() => {
        if (pendingConnectionRef.current?.promise === promise) {
          pendingConnectionRef.current = null;
        }
      });

      return promise;
    },
    [navigate],
  );

  useEffect(() => {
    async function initialize() {
      try {
        const authResponse = await apiFetch('/api/auth/me', undefined, {
          redirectOnUnauthorized: false,
        });
        if (!authResponse.ok) return;
        const user = await authResponse.json();
        if (!user?.id) return;

        setUser(user);
        const lobbyResponse = await apiFetch('/api/lobbies/me');
        if (!lobbyResponse.ok) {
          return;
        }
        const lobby = await lobbyResponse.json();
        if (!lobby?.code) return;
        codeLink.current = lobby.code;
        setLobbyCode(lobby.code);
        await connect(lobby.code);
      } catch (error) {
        if (error instanceof UnauthenticatedError) return;
        console.log('Failed to restore websocket connection:', error);
      }
    }

    initialize();
  }, [connect]);

  /**
   *
   * @brief emit a game action and report whether the server accepted it.
   *
   * @brief an illegal move raises a WsException server-side, which never calls
   * @brief the ack: listening to "exception" is what makes a refusal immediate
   * @brief instead of waiting the 2s timeout. Only one action is ever in flight,
   * @brief so the exception that lands here belongs to this action.
   *
   * @async @returns a Promise<boolean> that resolves false when the action is
   * @async refused, times out, or fails.
   *
   */
  function emitGameAction(
    event: string,
    payload: Record<string, unknown>,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = wsRef.current;

      if (!socket || !codeLink.current)
        throw new Error(`No active game. cannot emit ${event}`);

      let settled = false;

      const finish = (accepted: boolean, reason?: unknown) => {
        if (settled) return;

        settled = true;
        socket.off('exception', onRefused);

        if (!accepted) console.warn(`${event} refused`, reason);

        resolve(accepted);
      };

      const onRefused = (error: unknown) => finish(false, error);

      socket.on('exception', onRefused);

      socket.timeout(2000).emit(
        event,
        {
          lobbyCode: codeLink.current,
          ...payload,
        },
        // .timeout() places the error first, the server answer second.
        (timeoutError: Error | null, ack?: { ok: true }) => {
          finish(!timeoutError && ack?.ok === true, timeoutError);
        },
      );
    });
  }

  /**
   *
   * @brief handle the playing of card by slot number
   *
   * @async @returns a Promise<boolean>, false if the server refused the move
   *
   */
  function playCard(slot: number): Promise<boolean> {
    return emitGameAction('game:play-slot', { slot: slot });
  }

  /**
   *
   * @brief handle the playing of the four cards (must all be ONO99)
   *
   * @async @returns a Promise<boolean>, false if the server refused the move
   *
   */
  function playFour(): Promise<boolean> {
    return emitGameAction('game:discard-four-ono99', {});
  }

  /**
   *
   * @brief handle declaring forfeit
   *
   * @async @returns a Promise<boolean>, false if the server refused the action
   *
   */
  function unable(): Promise<boolean> {
    return emitGameAction('game:unable', {});
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
    setLobbyCode(null);
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

  function setUser(user: SelfUserInterface): void {
    userRef.current = user;
    userIdRef.current = userRef.current.id;
  }

  function getUser(): SelfUserInterface | null {
    return userRef.current;
  }

  function getCode(): string | null {
    return lobbyCode;
  }

  function setCode(code: string) {
    codeLink.current = code;
    setLobbyCode(code);
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
        setUser: setUser,
        gameState: useGameState,
        getUser: getUser,
        getCode: getCode,
        setCode: setCode,
      }}
    >
      {children}
    </WebsocketContext>
  );
}
