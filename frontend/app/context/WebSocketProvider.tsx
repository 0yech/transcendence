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
  const gameStartedRef = useRef<boolean>(false);
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
   * @returns a promise of if the connect failed or succeded
   */
  const connect = useCallback((code: string): Promise<boolean> => {
    return new Promise((resolve, reject) => {
    if (wsRef.current?.connected || code == codeLink.current)
        return true
      wsRef.current = io('/games', {
        reconnection: true,
      });
      if (wsRef.current) {
        disconnect();
      }
      const timeout = setTimeout(() => {
        reject(new Error('game:join timeout after 2s'));
      }, 2000);
      codeLink.current = code;

      /**
       *
       * @brief for now nothing happens here i don't really understand what it does
       */
      wsRef.current.on('game:error', (e) => {
        console.log('listening to game:error');
        clearTimeout(timeout);
        console.log(e);
      });
      wsRef.current.on('connect', () => console.log('connected to websocket'));
      wsRef.current.on('disconnect', () => console.log('disconnected'));

      /**
       *
       * @brief handle the game:join. join the game after every listener
       *
       * @async @returns create the new Promise<boolean> for the return or a throw if fails
       *
       */
        if (!wsRef.current) {
          clearTimeout(timeout);
          throw new Error('No game joined');
          return ;
        }
        wsRef.current.emit(
          'game:join',
          {
            lobbyCode: codeLink.current,
          },
          (ack: { success: boolean; lobbyCode: string } | null) => {
            clearTimeout(timeout);
            console.log("logged in");
            return resolve(true)
          }
        );
      /**
       *
       * @brief handle the useState of the game:state. on every new state a new render is forced
       */
      wsRef.current.on('game:state', (e) => {
        if (e.turnNumber == 1 || e.currentPlayerId == userIdRef.current) {
          navigate(`/game/${codeLink.current}/play`);
          gameStartedRef.current = true;
        }
        setGameState(e);
      });
    });
  }, [navigate]);


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
    if (wsRef.current?.connected) {
      wsRef.current.disconnect();
      wsRef.current = null;
      codeLink.current = null;
      gameStartedRef.current = false;
      setGameState(null);
    }
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
    return gameStartedRef.current;
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
