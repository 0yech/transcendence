import { Suspense, useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import type { ThreeElements } from '@react-three/fiber';
import { CardGeometry } from './CardGeometry';
import { createCardShape } from './cardShape';

type CardProps = ThreeElements['group'] & {
  width?: number;
  height?: number;
  thickness?: number;
  radius?: number;
  bevelSize?: number;
  frontImage?: string;
  backImage?: string;
};

/**
 * A card, with a Suspense boundary of its own.
 *
 * Without it every card lives under the single boundary wrapping the whole
 * scene, and one texture left to load blanks the entire table — hands, deck and
 * discard pile — until it arrives. Here a miss only hides the card that missed.
 */
export function Card(props: CardProps) {
  return (
    <Suspense fallback={null}>
      <CardMesh {...props} />
    </Suspense>
  );
}

function CardMesh({
  width = 3.5,
  height = 5.5,
  thickness = 0.05,
  radius = 0.3,
  bevelSize = 0.015,
  frontImage = '/cards/censored.png',
  backImage = '/cards/back.png',
  ...groupProps
}: CardProps) {
  /*
   * One URL per call, never an array: useLoader keys its cache on the whole
   * argument list, so asking for [front, back] builds a three-element key that
   * can never match the two-element keys preloadCardImages() filled in. Every
   * pairing would then load again from scratch, and suspend while it does.
   */
  const frontMap = useTexture(frontImage);
  const backMap = useTexture(backImage);

  const shape = useMemo(
    () => createCardShape(width, height, radius),
    [width, height, radius],
  );

  // ShapeGeometry uses the raw local vertex coordinates as UVs (from -width/2
  // to width/2), not normalised between 0 and 1. So we reframe the texture
  // itself for the final [0,1] to land exactly on the card edges.
  for (const map of [frontMap, backMap]) {
    map.repeat.set(1 / width, 1 / height);
    map.offset.set(0.5, 0.5);
  }

  const halfThickness = thickness / 2;
  const eps = 0.01; // nudges the faces apart to avoid z-fighting with the extruded body

  return (
    <group {...groupProps}>
      {/* the body: only visible on the edge, its faces are covered by the 2 planes below */}
      <mesh>
        <CardGeometry
          width={width}
          height={height}
          thickness={thickness}
          radius={radius}
          bevelSize={bevelSize}
        />
        <meshStandardMaterial color="#444444" roughness={0.6} metalness={0} />
      </mesh>

      {/* front face */}
      <mesh position={[0, 0, halfThickness + eps]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial map={frontMap} roughness={0.5} metalness={0} />
      </mesh>

      {/* back face: flipped 180° around Y so its pattern faces outwards */}
      <mesh position={[0, 0, -halfThickness - eps]} rotation={[0, Math.PI, 0]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial map={backMap} roughness={0.5} metalness={0} />
      </mesh>
    </group>
  );
}
