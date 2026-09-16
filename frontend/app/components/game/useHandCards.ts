import { useEffect, useRef, useState } from 'react';
import type { InterfaceCardsGameState } from '~/context/WebSocketContext';
import { FAN_RANK } from './layout';
import { cardImage } from './textures';

/**
 * The animation state of a four-card hand.
 *
 * The hook knows neither the network nor the 3D: it describes what each 3D
 * object must show and where it must go. The local player passes it a `commit`
 * that asks the server; an opponent's hand animates without one, the action
 * having already happened server-side.
 */

export type CardPhase = 'idle' | 'toDiscard' | 'fromDeck' | 'rejected';

export type CardState = {
  /** index (0-3) of the backend slot this 3D object stands for */
  slot: number;
  phase: CardPhase;
  /** texture currently displayed (frozen during the animation) */
  display: string;
  /** take-off delay, non-zero only during a quadruple ONO99 */
  delay: number;
};

/** The four ONO99s take off in a cascade, from the leftmost card to the rightmost. */
const FOUR_STAGGER_MS = 110;
const FOUR_DELAYS: number[] = FAN_RANK.map((rank) => rank * FOUR_STAGGER_MS);

const INITIAL_CARDS: CardState[] = [0, 1, 2, 3].map((slot) => ({
  slot,
  phase: 'idle',
  display: cardImage(null),
  delay: 0,
}));

export type HandCards = {
  cards: CardState[];
  /** true while a card is in flight: no move can leave in the meantime */
  animating: boolean;
  /** plays the card carried by the 3D object `index` */
  playCardAt: (
    index: number,
    commit?: (slot: number) => Promise<boolean>,
  ) => void;
  /** discards the four ONO99s in one go */
  discardFour: (commit?: () => Promise<boolean>) => void;
  /**
   * Replays an opponent's move. We do not know which card of their fan left —
   * so we pick at random among those at rest — but we do know which one lands
   * on the discard pile, and that is the one to show in flight.
   */
  replayOpponent: (revealed: InterfaceCardsGameState[]) => void;
  /** to call once the 3D object `index` has finished its flight */
  handleArrived: (index: number) => void;
};

/**
 * @param onLanded notified every time a card of this hand lands on the discard
 * pile, so that the pile only reveals itself at that moment.
 */
export function useHandCards(
  hand: InterfaceCardsGameState[],
  onLanded?: () => void,
): HandCards {
  const [cards, setCards] = useState<CardState[]>(INITIAL_CARDS);

  // The asynchronous callbacks (end of flight, server answer) read the
  // current state without having to appear in any dependency list.
  const handRef = useRef(hand);
  const cardsRef = useRef(cards);
  const landedRef = useRef(onLanded);
  useEffect(() => {
    handRef.current = hand;
    cardsRef.current = cards;
    landedRef.current = onLanded;
  });

  // Stable key: only changes if the real contents of the hand change.
  const handKey = hand.map((c) => c?.id ?? '').join('|');
  /*
   * A card at rest always shows what the backend says; a card in flight keeps
   * its texture frozen until it arrives.
   */
  useEffect(() => {
    setCards((prev) =>
      prev.map((c) =>
        c.phase === 'idle'
          ? { ...c, display: cardImage(handRef.current[c.slot]) }
          : c,
      ),
    );
  }, [handKey]);

  /** Sends a card to the discard pile and returns the slot it occupied. */
  const startPlay = (index: number, display?: string): number => {
    const played = cardsRef.current[index].slot;

    // The backend shifts: every slot > played loses 1, the new card lands at 3.
    setCards((prev) =>
      prev.map((c, i) => {
        if (i === index)
          return {
            ...c,
            slot: 3,
            phase: 'toDiscard',
            delay: 0,
            display: display ?? c.display,
          };
        return c.slot > played ? { ...c, slot: c.slot - 1 } : c;
      }),
    );

    return played;
  };

  /** Sends the four cards to the discard pile in a cascade. */
  const startDiscardFour = (displays?: string[]) => {
    // The backend empties the hand and refills it at once: the slots do not
    // move, the four cards leave and each comes back to its own place.
    setCards((prev) =>
      prev.map((c, i) => ({
        ...c,
        phase: 'toDiscard',
        delay: FOUR_DELAYS[i],
        display: displays?.[i] ?? c.display,
      })),
    );
  };

  const playCardAt = (
    index: number,
    commit?: (slot: number) => Promise<boolean>,
  ) => {
    const played = startPlay(index);

    if (!commit) return;

    // Exactly the inverse of the shift above. The display is recomputed
    // because a late refusal can arrive after handleArrived has already frozen
    // the slot 3 texture onto this card.
    const rollback = () =>
      setCards((prev) =>
        prev.map((c, i) => {
          if (i === index)
            return {
              ...c,
              slot: played,
              phase: 'rejected',
              display: cardImage(handRef.current[played]),
            };
          return c.slot >= played ? { ...c, slot: c.slot + 1 } : c;
        }),
      );

    settle(commit(played), rollback, 'play-slot');
  };

  const discardFour = (commit?: () => Promise<boolean>) => {
    startDiscardFour();

    if (!commit) return;

    const rollback = () =>
      setCards((prev) =>
        prev.map((c, i) => ({
          ...c,
          phase: 'rejected',
          delay: FOUR_DELAYS[i],
          display: cardImage(handRef.current[c.slot]),
        })),
      );

    settle(commit(), rollback, 'discard-four-ono99');
  };

  const replayOpponent = (revealed: InterfaceCardsGameState[]) => {
    if (revealed.length >= 4) {
      startDiscardFour(revealed.slice(-4).map((card) => cardImage(card)));
      return;
    }

    const idle = cardsRef.current.flatMap((c, i) =>
      c.phase === 'idle' ? [i] : [],
    );

    if (idle.length === 0) return;

    startPlay(
      idle[Math.floor(Math.random() * idle.length)],
      cardImage(revealed[0] ?? null),
    );
  };

  const handleArrived = (index: number) => {
    // Outside the updater: React may replay it twice in StrictMode, and the
    // discard pile would then reveal itself twice for a single landing.
    if (cardsRef.current[index].phase === 'toDiscard') landedRef.current?.();

    setCards((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;

        if (c.phase === 'toDiscard') {
          // the card is on the discard pile: we swap the texture now, and set
          // off again from the deck. The delay is already spent.
          return {
            ...c,
            phase: 'fromDeck',
            delay: 0,
            display: cardImage(handRef.current[c.slot]),
          };
        }

        if (c.phase === 'fromDeck' || c.phase === 'rejected')
          return { ...c, phase: 'idle' };

        return c;
      }),
    );
  };

  return {
    cards,
    animating: cards.some((c) => c.phase !== 'idle'),
    playCardAt,
    discardFour,
    replayOpponent,
    handleArrived,
  };
}

/** Brings the cards back into the hand if the server refused the move. */
function settle(
  answer: Promise<boolean>,
  rollback: () => void,
  label: string,
): void {
  answer
    .then((accepted) => {
      if (!accepted) rollback();
    })
    .catch((error) => {
      console.error(`${label} failed`, error);
      rollback();
    });
}
