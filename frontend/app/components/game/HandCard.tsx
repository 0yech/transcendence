import { useEffect, useRef, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import {
  useSpring,
  animated,
  easings,
  type SpringValue,
} from '@react-spring/three';
import { Card } from './Card';
import type { CardPhase } from './useHandCards';
import {
  arcWeight,
  FLAT_ROT,
  HOVER_POS,
  HOVER_ROT,
  REST_POS,
  REST_ROT,
  type HandFrame,
  type Vec3,
} from './layout';

const SPRING_CONFIG = { tension: 170, friction: 22 };
const HOVER_CONFIG = { tension: 320, friction: 26 };
// Sharp and nervous: this is a refusal, not a game move.
const DENY_CONFIG = { tension: 1400, friction: 24 };

/**
 * The @react-three/fiber types do not accept a SpringValue of a tuple, which
 * react-spring nonetheless animates without trouble. A workaround until the
 * two typings meet.
 */
const animatedVec3 = (value: SpringValue<Vec3>) => value as unknown as Vec3;

type HandCardProps = {
  // position in the fan (0-3), which fixes the resting pose
  index: number;
  //  flight targets, specific to this hand's seat
  frame: HandFrame;
  frontImage: string;
  phase: CardPhase;
  // take-off delay, in ms
  delay: number;
  // an opponent's hand is looked at but not clicked
  interactive: boolean;
  // will the backend accept this move right now?
  playable: boolean;
  onArrived: () => void;
  onPlay: () => void;
};

export function HandCard({
  index,
  frame,
  frontImage,
  phase,
  delay,
  interactive,
  playable,
  onArrived,
  onPlay,
}: HandCardProps) {
  const [hovered, setHovered] = useState(false);

  const [spring, api] = useSpring<{
    position: Vec3;
    rotation: Vec3;
    arc: number;
  }>(() => ({
    position: REST_POS[index],
    rotation: REST_ROT[index],
    arc: 1, // arcWeight(1) === 0 when not flying
    config: SPRING_CONFIG,
  }));

  // The refusal lives on a nested group: it layers over the current pose
  // (resting or hovered) instead of fighting with it.
  const [denySpring, denyApi] = useSpring<{ offset: number }>(() => ({
    offset: 0,
    config: DENY_CONFIG,
  }));

  // We keep the callback in a ref so that it does not restart the effect.
  const arrivedRef = useRef(onArrived);
  useEffect(() => {
    arrivedRef.current = onArrived;
  });

  useEffect(() => {
    if (phase === 'idle') {
      api.start({
        position: hovered ? HOVER_POS[index] : REST_POS[index],
        rotation: hovered ? HOVER_ROT[index] : REST_ROT[index],
        config: HOVER_CONFIG,
      });
      return;
    }

    let cancelled = false;

    const run = async () => {
      if (phase === 'fromDeck') {
        // instant teleport onto the deck before setting off again
        api.set({ position: frame.deck, rotation: FLAT_ROT });
      }

      // 'fromDeck' and 'rejected' both aim at the hand: only the first
      // teleports onto the deck beforehand.
      const target =
        phase === 'toDiscard'
          ? { position: frame.discard, rotation: FLAT_ROT }
          : { position: REST_POS[index], rotation: REST_ROT[index] };

      await Promise.all(
        api.start({
          ...target,
          arc: 1,
          from: { arc: 0 },
          config: SPRING_CONFIG,
          delay,
        }),
      );
      if (!cancelled) arrivedRef.current();
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [phase, hovered, delay, index, frame, api]);

  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = 'pointer';
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [hovered]);

  const refuse = () => {
    denyApi.start({
      from: { offset: 0 },
      to: async (next) => {
        await next({
          offset: 0.2,
          config: { duration: 55, easing: easings.easeOutBack },
        });
        await next({
          offset: -0.2,
          config: { duration: 55, easing: easings.easeOutBack },
        });
        await next({
          offset: 0.1,
          config: { duration: 45, easing: easings.easeOutBack },
        });
        await next({
          offset: -0.1,
          config: { duration: 45, easing: easings.easeOutBack },
        });
        await next({ offset: 0 });
      },
    });
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!interactive) return;

    e.stopPropagation();

    if (playable) {
      // the card is leaving: without this it would come back to the hovered
      // pose, r3f not emitting a pointerout when it is the object that moves.
      setHovered(false);
      onPlay();
      return;
    }

    if (phase === 'idle') refuse();
  };

  return (
    // The arc is carried by the outermost group: its offset therefore stays
    // vertical in the hand's space, without following the card as it tips flat.
    <animated.group
      position-y={spring.arc.to((t) => arcWeight(t) * frame.arcUp[1])}
      position-z={spring.arc.to((t) => arcWeight(t) * frame.arcUp[2])}
    >
      <animated.group
        position={animatedVec3(spring.position)}
        rotation={animatedVec3(spring.rotation)}
      >
        <animated.group
          position-x={denySpring.offset}
          rotation-z={denySpring.offset.to((o) => o * -0.25)}
        >
          <Card
            frontImage={frontImage}
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            onClick={handleClick}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              if (!interactive) return;
              // without this the cards behind think they are hovered too
              e.stopPropagation();
              if (phase === 'idle') setHovered(true);
            }}
            onPointerOut={() => setHovered(false)}
          />
        </animated.group>
      </animated.group>
    </animated.group>
  );
}
