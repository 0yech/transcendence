import { useMemo } from 'react';
import { HandCard } from './HandCard';
import { HAND_LOCAL_POS, HAND_TILT, handFrame } from './layout';
import type { CardState } from './useHandCards';

/**
 * A player's fan, laid out at their seat. The seat turns around the table, the
 * hand stays "in front of them": that is the only difference between the local
 * player and an opponent. A hand with no `onPlay` is neither clickable nor
 * hoverable.
 */
type PlayerHandProps = {
  /** seat angle around the table, 0 for the local player */
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
