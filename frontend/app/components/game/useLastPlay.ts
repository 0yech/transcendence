import { useEffect, useRef, useState } from 'react';
import { UseWebSocket } from '~/context/UseWebSocket';
import type { InterfaceCardsGameState } from '~/context/WebSocketContext';

/**
 * Le dernier coup posé sur la table, adversaires compris.
 *
 * Le backend n'annonce pas "qui vient de jouer" de façon fiable :
 * lastPlayedById n'est pas mis à jour lors d'un quadruple ONO99. En revanche
 * toute action est forcément le fait du joueur dont c'était le tour, donc
 * l'auteur est le currentPlayerId de l'état précédent.
 */
export type TablePlay = {
  actorId: string;
  /** les cartes qui viennent d'atterrir sur la défausse */
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

    // Premier état reçu : rien à rejouer, on se contente de mémoriser.
    if (!previous || gameState.turnNumber <= previous.turnNumber) return;

    const added = pile.length - previous.pileSize;

    /*
     * added <= 0 couvre deux cas sans animation : le joueur a déclaré ne pas
     * pouvoir jouer, ou la défausse vient d'être remélangée dans la pioche.
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
