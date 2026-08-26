import { useEffect, useRef, useState } from 'react';
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
   * @brief used to set ONCE and only ONCE the userIdRef for fast comparaisons and easier access
   *
   */
  useEffect(() => {
    apiFetch('/api/auth/me')
      .then((data) => data.json())
      .then((json) => {
        userIdRef.current = json.id;
        return json.id;
      });
  }, []);

  /**
   *
   * @brief handle the first connection to a server. start listening on game:state.
   * @brief if it's user's turn or first turn everybody get "teported" to the right route '/game/:code/play'
   * @brief start all the listens (game:state, game:error, connect, disconnect)
   *
   * @returns a promise of if the connect failed or succeded
   */
  function connect(code: string): Promise<boolean> {
    wsRef.current = io('/games', {
      reconnection: true,
    });
    codeLink.current = code;

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

    /**
     *
     * @brief for now nothing happens here i don't really understand what it does
     */
    wsRef.current.on('game:error', (e) => {
      console.log('listening to game:error');
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
    return new Promise((resolve) => {
      if (!wsRef.current) throw new Error('No game joined');
      wsRef.current.emit(
        'game:join',
        {
          lobbyCode: codeLink.current,
        },
        (ack: { success: boolean; lobbyCode: string }) => resolve(ack.success),
      );
    });
  }

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
      wsRef.current.emit(
        'game:play-slot',
        {
          lobbyCode: codeLink.current,
          slot: slot,
        },
        (ack: { ok: boolean }) => {
          console.log('played slot ' + slot);
          return resolve(ack.ok);
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
      wsRef.current.emit(
        'game:start',
        {
          lobbyCode: codeLink.current,
        },
        (ack: { ok: boolean }) => resolve(ack.ok),
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

  function myId(): string | null {
    return userIdRef.current;
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
        myId: myId,
        gameState: useGameState,
      }}
    >
      {children}
    </WebsocketContext>
  );
}
