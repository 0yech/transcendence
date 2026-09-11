import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { UseWebSocket } from '~/context/UseWebSocket';
import { GameHud } from './GameHud';
import { GameTable } from './GameTable';
import { canPlayCard, hasFourOno99 } from './rules';
import { useHandCards } from './useHandCards';

/**
 * Le joueur local : ce qu'il a le droit de jouer, et ce qu'on envoie au serveur.
 *
 * L'état d'animation vit dans useHandCards, la scène dans GameTable et
 * l'habillage dans GameHud.
 */
export function Game() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { playSlot, playFour, unable, gameState, userId, getCode } =
    UseWebSocket();

  const lobbyCode = getCode();

  /* --- main du joueur ------------------------------------------------ */

  const me = gameState?.players.find((p) => p.userId === userId());
  const rawHand = me?.hand;
  const hand = Array.isArray(rawHand) ? rawHand : [];

  const { cards, animating, playCardAt, discardFour, handleArrived } =
    useHandCards(hand);

  /* --- jouabilité ----------------------------------------------------- */
  // Mêmes conditions que le backend : sans ça l'animation partirait pour un
  // coup refusé par le serveur, et la main affichée deviendrait fausse.

  const isMyTurn =
    gameState?.status === 'IN_PROGRESS' &&
    gameState.currentPlayerId === userId() &&
    me?.status === 'ACTIVE';

  // Tant qu'une carte vole, les slots sont décalés de façon optimiste et la
  // main de référence n'est pas à jour : on ne peut rien valider de fiable.
  const canPlaySlot = (slot: number) =>
    isMyTurn && !animating && canPlayCard(hand[slot], gameState?.total ?? 0);

  const canPlayFour = isMyTurn && !animating && hasFourOno99(hand);

  /* --- coups --------------------------------------------------------- */

  const handlePlay = (index: number) => {
    if (!canPlaySlot(cards[index].slot)) return;
    // le backend numérote les slots à partir de 1
    playCardAt(index, (slot) => playSlot(slot + 1));
  };

  const handlePlayFour = () => {
    if (!canPlayFour) return;
    discardFour(playFour);
  };

  /* --- navigation de fin de partie ----------------------------------- */

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
        canPlaySlot={canPlaySlot}
        onPlay={handlePlay}
        onArrived={handleArrived}
      />
    </>
  );
}
