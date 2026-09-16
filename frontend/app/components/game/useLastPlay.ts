import { useEffect, useRef, useState } from 'react';
import { UseWebSocket } from '~/context/UseWebSocket';
import type { InterfaceCardsGameState } from '~/context/WebSocketContext';

/**
 * The last move laid on the table, opponents included.
 *
 * The backend does not reliably announce "who just played": lastPlayedById is
 * not updated on a quadruple ONO99. Any action, however, is necessarily the
 * doing of the player whose turn it was, so the author is the currentPlayerId
 * of the previous state.
 */
export type TablePlay = {
  actorId: string;
  /** the cards that have just landed on the discard pile */
  revealed: InterfaceCardsGameState[];
  turnNumber: number;
};

type Snapshot = {
  turnNumber: number;
  pileSize: number;
  currentPlayerId: string | null;
};

export function useLastPlay(): TablePlay | null {
  const { gameState } = UseWebSocket();
  const [play, setPlay] = useState<TablePlay | null>(null);
  const previousRef = useRef<Snapshot | null>(null);

  useEffect(() => {
    if (!gameState || gameState.turnNumber === undefined) return;

    const pile = gameState.discardPile ?? [];
    const previous = previousRef.current;

    previousRef.current = {
      turnNumber: gameState.turnNumber,
      pileSize: pile.length,
      currentPlayerId: gameState.currentPlayerId,
    };

    // First state received: nothing to replay, we merely memorise it.
    if (!previous || gameState.turnNumber <= previous.turnNumber) return;

    const added = pile.length - previous.pileSize;

    /*
     * added <= 0 covers two cases with no animation: the player declared they
     * could not play, or the discard pile was just reshuffled into the deck.
     */
    if (added <= 0 || !previous.currentPlayerId) return;

    setPlay({
      actorId: previous.currentPlayerId,
      revealed: pile.slice(-added),
      turnNumber: gameState.turnNumber,
    });
  }, [gameState]);

  return play;
}
