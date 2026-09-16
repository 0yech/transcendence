import { useEffect, useRef } from 'react';
import { PlayerHand } from './PlayerHand';
import { useHandCards } from './useHandCards';
import type { TablePlay } from './useLastPlay';
import type { InterfaceCardsGameState } from '~/context/WebSocketContext';

/**
 * An opponent's hand: four card backs that animate when the server announces
 * they have played.
 *
 * The contents of their hand are never transmitted — the backend only sends
 * the count — hence the empty hand passed to useHandCards: every card shows
 * the hidden texture, and the fan is turned towards its player anyway, so its
 * back is what we see.
 */
const HIDDEN_HAND: InterfaceCardsGameState[] = [];

type OpponentHandProps = {
  playerId: string;
  angle: number;
  lastPlay: TablePlay | null;
  /** one of their cards has just landed on the discard pile */
  onLanded: () => void;
};

export function OpponentHand({
  playerId,
  angle,
  lastPlay,
  onLanded,
}: OpponentHandProps) {
  const { cards, replayOpponent, handleArrived } = useHandCards(
    HIDDEN_HAND,
    onLanded,
  );

  // The hook is recreated on every render: passing it as a dependency would
  // restart the animation in a loop.
  const replayRef = useRef(replayOpponent);
  useEffect(() => {
    replayRef.current = replayOpponent;
  });

  useEffect(() => {
    if (!lastPlay || lastPlay.actorId !== playerId) return;
    replayRef.current(lastPlay.revealed);
  }, [lastPlay, playerId]);

  return <PlayerHand angle={angle} cards={cards} onArrived={handleArrived} />;
}
