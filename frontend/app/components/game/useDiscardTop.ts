import { useCallback, useEffect, useRef, useState } from 'react';
import { UseWebSocket } from '~/context/UseWebSocket';
import type { InterfaceCardsGameState } from '~/context/WebSocketContext';

/**
 * The top of the discard pile as it must be *displayed*.
 *
 * The backend announces the new top as soon as it accepts a move, so while the
 * card is still in flight: showing it right away would show it twice, on the
 * pile and in the air. We therefore keep the old top until a card lands — the
 * same freeze as the `display` of a card in hand.
 */
export type DiscardTop = {
  /** the card to show on the pile, not necessarily the backend's */
  card: InterfaceCardsGameState | null;
  /** to call when a card has just landed on the discard pile */
  commit: () => void;
};

/**
 * Safety net: not every move is animated — a player eliminated by their own
 * move has their hand unmounted before the flight — and without this the top
 * would stay frozen forever. Wide compared to the longest flight, the cascade
 * of four ONO99s included.
 */
const COMMIT_TIMEOUT_MS = 2500;

/**
 * On a slow connection the card lands before the server state arrives: we hold
 * that credit for a short while, to reveal the pile as soon as it comes rather
 * than freeze it for a flight already over. It is forgotten afterwards, since a
 * late-refused move also lands without ever having anything to reveal.
 */
const EARLY_LANDING_MS = 1000;

type Snapshot = {
  turnNumber: number;
  pileSize: number;
};

type Timer = ReturnType<typeof setTimeout>;

export function useDiscardTop(): DiscardTop {
  const { gameState } = UseWebSocket();
  const [card, setCard] = useState<InterfaceCardsGameState | null>(null);

  /** the real top awaiting a landing; null when nothing is frozen */
  const pendingRef = useRef<InterfaceCardsGameState | null>(null);
  const previousRef = useRef<Snapshot | null>(null);
  const timerRef = useRef<Timer | null>(null);
  /** time of the last landing that arrived before its server state */
  const landedAtRef = useRef(0);

  // Stable: useHandCards keeps this callback for the lifetime of a hand.
  const commit = useCallback(() => {
    clearTimer(timerRef);

    if (!pendingRef.current) {
      landedAtRef.current = Date.now();
      return;
    }

    setCard(pendingRef.current);
    pendingRef.current = null;
  }, []);

  useEffect(() => {
    if (!gameState || gameState.turnNumber === undefined) return;

    const pile = gameState.discardPile ?? [];
    const top = pile[pile.length - 1] ?? null;
    const previous = previousRef.current;

    previousRef.current = {
      turnNumber: gameState.turnNumber,
      pileSize: pile.length,
    };

    /*
     * A pile that grows from one turn to the next means a card is in flight: we
     * freeze. Everything else syncs immediately — first state received, "I
     * cannot play", or discard pile reshuffled into the deck.
     */
    const played =
      previous !== null &&
      gameState.turnNumber > previous.turnNumber &&
      pile.length > previous.pileSize;

    const reveal = () => {
      pendingRef.current = null;
      clearTimer(timerRef);
      setCard((shown) => (shown?.id === top?.id ? shown : top));
    };

    if (!played) {
      reveal();
      return;
    }

    // The card landed before its state arrived: nothing left to hide.
    if (Date.now() - landedAtRef.current < EARLY_LANDING_MS) {
      landedAtRef.current = 0;
      reveal();
      return;
    }

    // A second move before the first one lands overwrites the target: it is
    // always the most recent top that we want to reveal.
    pendingRef.current = top;
    clearTimer(timerRef);
    timerRef.current = setTimeout(commit, COMMIT_TIMEOUT_MS);
  }, [gameState, commit]);

  useEffect(() => () => clearTimer(timerRef), []);

  return { card, commit };
}

function clearTimer(ref: { current: Timer | null }): void {
  if (ref.current === null) return;
  clearTimeout(ref.current);
  ref.current = null;
}
