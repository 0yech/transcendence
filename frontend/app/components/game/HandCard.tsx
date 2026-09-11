import { useEffect, useRef, useState } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { useSpring, animated, type SpringValue } from '@react-spring/three';
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
// Sec et nerveux : c'est un refus, pas un mouvement de jeu.
const DENY_CONFIG = { tension: 1400, friction: 24 };

/**
 * Les types de @react-three/fiber n'acceptent pas un SpringValue de tuple, que
 * react-spring anime pourtant sans problème. Contournement le temps que les
 * deux typages se rejoignent.
 */
const animatedVec3 = (value: SpringValue<Vec3>) => value as unknown as Vec3;

type HandCardProps = {
  /** position dans l'éventail (0-3), qui fixe la pose au repos */
  index: number;
  /** cibles de vol, propres au siège de cette main */
  frame: HandFrame;
  frontImage: string;
  phase: CardPhase;
  /** retard au décollage, en ms */
  delay: number;
  /** une main adverse se regarde mais ne se clique pas */
  interactive: boolean;
  /** le backend acceptera-t-il ce coup maintenant ? */
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
    arc: 1, // hors vol seul compte arcWeight(1) === 0
    config: SPRING_CONFIG,
  }));

  // Le refus vit sur un groupe imbriqué : il se superpose à la pose courante
  // (repos ou survol) au lieu d'entrer en conflit avec elle.
  const [denySpring, denyApi] = useSpring<{ offset: number }>(() => ({
    offset: 0,
    config: DENY_CONFIG,
  }));

  // On garde le callback dans une ref pour qu'il ne relance pas l'effet.
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
        // téléportation instantanée vers la pioche avant de repartir
        api.set({ position: frame.deck, rotation: FLAT_ROT });
      }

      // 'fromDeck' et 'rejected' visent tous deux la main : seul le premier
      // se téléporte d'abord sur la pioche.
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
        await next({ offset: 0.28 });
        await next({ offset: -0.24 });
        await next({ offset: 0.14 });
        await next({ offset: 0 });
      },
    });
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (!interactive) return;

    e.stopPropagation();

    if (playable) {
      // la carte s'en va : sans ça elle reviendrait en pose survolée, r3f
      // n'émettant pas de pointerout quand c'est l'objet qui bouge.
      setHovered(false);
      onPlay();
      return;
    }

    if (phase === 'idle') refuse();
  };

  return (
    // L'arc est porté par le groupe le plus externe : son offset reste ainsi
    // vertical dans l'espace de la main, sans suivre la carte qui bascule à plat.
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
              // sans ça les cartes situées derrière se croient survolées aussi
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
