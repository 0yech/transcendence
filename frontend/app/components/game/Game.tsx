import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { UseWebSocket } from '~/context/UseWebSocket';
import { GameHud } from './GameHud';
import { GameTable } from './GameTable';
import { canPlayCard, hasFourOno99 } from './rules';
import { useDiscardTop } from './useDiscardTop';
import { useHandCards } from './useHandCards';

/**
 * The local player: what they are allowed to play, and what we send to the
 * server.
 *
 * The animation state lives in useHandCards, the scene in GameTable and the
 * chrome in GameHud.
 */
export function Game() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { playSlot, playFour, unable, gameState, userId, getCode } =
    UseWebSocket();

  const lobbyCode = getCode();

  // player and
  const me = gameState?.players.find((p) => p.userId === userId());
  const rawHand = me?.hand;
  const hand = Array.isArray(rawHand) ? rawHand : [];

  /* discard pile
   *   The pile only reveals itself once a card has landed, hence the commit
   *   wired to both animation sources: this hand and the ones across the table.
   */
  const discardTop = useDiscardTop();

  const { cards, animating, playCardAt, discardFour, handleArrived } =
    useHandCards(hand, discardTop.commit);

  /* playability
   *   Same conditions as the backend: without this the animation would start
   *   for a move the server refuses, and the displayed hand would go wrong.
   */
  const isMyTurn =
    gameState?.status === 'IN_PROGRESS' &&
    gameState.currentPlayerId === userId() &&
    me?.status === 'ACTIVE';

  // While a card is in flight the slots are shifted optimistically and the
  // reference hand is out of date: nothing can be validated reliably.
  const canPlaySlot = (slot: number) =>
    isMyTurn && !animating && canPlayCard(hand[slot], gameState?.total ?? 0);

  const canPlayFour = isMyTurn && !animating && hasFourOno99(hand);

  // moves
  const handlePlay = (index: number) => {
    if (!canPlaySlot(cards[index].slot)) return;
    // the backend numbers slots from 1
    playCardAt(index, (slot) => playSlot(slot + 1));
  };

  const handlePlayFour = () => {
    if (!canPlayFour) return;
    discardFour(playFour);
  };

  // end of game navigation
  useEffect(() => {
    if (gameState?.status !== 'FINISHED') return;
    const id = setTimeout(() => navigate(`/game/${lobbyCode}`), 10000);
    return () => clearTimeout(id);
  }, [gameState?.status, navigate, lobbyCode]);

  if (!code) return null;

  return (
    <>
      <GameHud
        code={code}
        hasHand={hand.length > 0}
        canPlayFour={canPlayFour}
        onPlayFour={handlePlayFour}
        onUnable={unable}
      />

      <GameTable
        cards={cards}
        discardTop={discardTop.card}
        canPlaySlot={canPlaySlot}
        onPlay={handlePlay}
        onArrived={handleArrived}
        onOpponentLanded={discardTop.commit}
      />
    </>
  );
}
