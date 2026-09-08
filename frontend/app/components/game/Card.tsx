import { useMemo } from 'react';
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

export function Card({
  width = 3.5,
  height = 5.5,
  thickness = 0.05,
  radius = 0.3,
  bevelSize = 0.015,
  frontImage = '/cards/censored.png',
  backImage = '/cards/back.png',
  ...groupProps
}: CardProps) {
  const [frontMap, backMap] = useTexture([frontImage, backImage]);
  const shape = useMemo(
    () => createCardShape(width, height, radius),
    [width, height, radius],
  );

  // ShapeGeometry utilise les coordonnées locales du vertex comme UV brutes
  // (de -width/2 à width/2), pas normalisées entre 0 et 1. On recadre donc
  // la texture elle-même pour que le [0,1] final tombe pile sur les bords de la carte.
  for (const map of [frontMap, backMap]) {
    map.repeat.set(1 / width, 1 / height);
    map.offset.set(0.5, 0.5);
  }

  const halfThickness = thickness / 2;
  const eps = 0.001; // décale légèrement les faces pour éviter le z-fighting avec le corps extrudé

  return (
    <group {...groupProps}>
      {/* le corps : uniquement visible sur la tranche, les faces sont recouvertes par les 2 plans ci-dessous */}
      <mesh>
        <CardGeometry
          width={width}
          height={height}
          thickness={thickness}
          radius={radius}
          bevelSize={bevelSize}
        />
        <meshStandardMaterial color="white" roughness={0.6} metalness={0} />
      </mesh>

      {/* face avant */}
      <mesh position={[0, 0, halfThickness + eps]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial map={frontMap} roughness={0.5} metalness={0} />
      </mesh>

      {/* face arrière : retournée à 180° autour de Y pour que son motif soit orienté vers l'extérieur */}
      <mesh position={[0, 0, -halfThickness - eps]} rotation={[0, Math.PI, 0]}>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial map={backMap} roughness={0.5} metalness={0} />
      </mesh>
    </group>
  );
}
