import { useEffect, useRef, useState } from 'react';
import type { InterfaceCardsGameState } from '~/context/WebSocketContext';
import { FAN_RANK } from './layout';
import { cardImage } from './textures';

/**
 * L'état d'animation d'une main de quatre cartes.
 *
 * Le hook ne connaît ni le réseau ni la 3D : il décrit ce que chaque objet 3D
 * doit montrer et où il doit aller. Le joueur local lui passe un `commit` qui
 * interroge le serveur ; une main adverse s'anime sans commit, l'action ayant
 * déjà eu lieu côté serveur.
 */

export type CardPhase = 'idle' | 'toDiscard' | 'fromDeck' | 'rejected';

export type CardState = {
  /** index (0-3) du slot backend que cet objet 3D représente */
  slot: number;
  phase: CardPhase;
  /** texture actuellement affichée (gelée pendant l'animation) */
  display: string;
  /** retard au décollage, non nul seulement pendant un quadruple ONO99 */
  delay: number;
};

/** Les quatre ONO99 décollent en cascade, de la carte la plus à gauche à la plus à droite. */
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
  /** vrai tant qu'une carte est en vol : aucun coup ne peut partir entre-temps */
  animating: boolean;
  /** joue la carte portée par l'objet 3D `index` */
  playCardAt: (
    index: number,
    commit?: (slot: number) => Promise<boolean>,
  ) => void;
  /** défausse les quatre ONO99 d'un coup */
  discardFour: (commit?: () => Promise<boolean>) => void;
  /**
   * Rejoue le coup d'un adversaire. On ignore quelle carte de son éventail est
   * partie — on choisit donc au hasard parmi celles au repos — mais on sait
   * laquelle atterrit sur la défausse, et c'est elle qu'il faut montrer en vol.
   */
  replayOpponent: (revealed: InterfaceCardsGameState[]) => void;
  /** à appeler quand l'objet 3D `index` a fini son vol */
  handleArrived: (index: number) => void;
};

export function useHandCards(hand: InterfaceCardsGameState[]): HandCards {
  const [cards, setCards] = useState<CardState[]>(INITIAL_CARDS);

  // Les callbacks asynchrones (fin de vol, réponse du serveur) lisent l'état
  // courant sans avoir à figurer dans des dépendances.
  const handRef = useRef(hand);
  const cardsRef = useRef(cards);
  useEffect(() => {
    handRef.current = hand;
    cardsRef.current = cards;
  });

  // Clé stable : ne change que si le contenu réel de la main change.
  const handKey = hand.map((c) => c?.id ?? '').join('|');

  /*
   * Une carte au repos affiche toujours ce que dit le backend ; une carte en vol
   * garde sa texture gelée jusqu'à son arrivée.
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

  /** Envoie une carte à la défausse et renvoie le slot qu'elle occupait. */
  const startPlay = (index: number, display?: string): number => {
    const played = cardsRef.current[index].slot;

    // Le backend décale : tout slot > played perd 1, la nouvelle carte arrive en 3.
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

  /** Envoie les quatre cartes à la défausse en cascade. */
  const startDiscardFour = (displays?: string[]) => {
    // Le backend vide la main et la remplit aussitôt : les slots ne bougent pas,
    // les quatre cartes partent et reviennent chacune à sa place.
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

    // Exactement l'inverse du décalage ci-dessus. Le display est recalculé car
    // un refus tardif peut arriver après que handleArrived ait déjà gelé la
    // texture du slot 3 sur cette carte.
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
    setCards((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c;

        if (c.phase === 'toDiscard') {
          // la carte est sur la défausse : on change la texture maintenant, et
          // on repart de la pioche. Le retard est déjà consommé.
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

/** Ramène les cartes en main si le serveur a refusé le coup. */
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
