import { useEffect, useRef } from 'react';
import { PlayerHand } from './PlayerHand';
import { useHandCards } from './useHandCards';
import type { TablePlay } from './useLastPlay';
import type { InterfaceCardsGameState } from '~/context/WebSocketContext';

/**
 * La main d'un adversaire : quatre dos de cartes qui s'animent quand le serveur
 * annonce qu'il a joué.
 *
 * Le contenu de sa main n'est jamais transmis — le backend n'en envoie que le
 * nombre — d'où la main vide passée à useHandCards : chaque carte affiche la
 * texture masquée, et de toute façon l'éventail est tourné vers son joueur,
 * donc c'est son dos qu'on voit.
 */
const HIDDEN_HAND: InterfaceCardsGameState[] = [];

type OpponentHandProps = {
  playerId: string;
  angle: number;
  lastPlay: TablePlay | null;
};

export function OpponentHand({ playerId, angle, lastPlay }: OpponentHandProps) {
  const { cards, replayOpponent, handleArrived } = useHandCards(HIDDEN_HAND);

  // Le hook se recrée à chaque rendu : le passer en dépendance relancerait
  // l'animation en boucle.
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
