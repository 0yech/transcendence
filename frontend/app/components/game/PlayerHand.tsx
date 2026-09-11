import { useMemo } from 'react';
import { HandCard } from './HandCard';
import { HAND_LOCAL_POS, HAND_TILT, handFrame } from './layout';
import type { CardState } from './useHandCards';

/**
 * L'éventail d'un joueur, posé à son siège. Le siège tourne autour de la table,
 * la main reste "devant lui" : c'est la seule différence entre le joueur local
 * et un adversaire. Une main sans `onPlay` n'est ni cliquable ni survolable.
 */
type PlayerHandProps = {
  /** angle du siège autour de la table, 0 pour le joueur local */
  angle: number;
  cards: CardState[];
  onArrived: (index: number) => void;
  canPlay?: (slot: number) => boolean;
  onPlay?: (index: number) => void;
};

export function PlayerHand({
  angle,
  cards,
  onArrived,
  canPlay,
  onPlay,
}: PlayerHandProps) {
  const frame = useMemo(() => handFrame(angle), [angle]);
  const interactive = Boolean(onPlay);

  return (
    <group rotation={[0, angle, 0]}>
      <group position={HAND_LOCAL_POS} rotation={[HAND_TILT, 0, 0]}>
        {cards.map((card, i) => (
          <HandCard
            key={`card${i}`}
            index={i}
            frame={frame}
            frontImage={card.display}
            phase={card.phase}
            delay={card.delay}
            interactive={interactive}
            playable={interactive && (canPlay?.(card.slot) ?? false)}
            onArrived={() => onArrived(i)}
            onPlay={() => onPlay?.(i)}
          />
        ))}
      </group>
    </group>
  );
}
