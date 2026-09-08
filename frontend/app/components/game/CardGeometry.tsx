import { useRef, useMemo, useLayoutEffect } from 'react';
import { ExtrudeGeometry } from 'three';
import { toCreasedNormals } from 'three-stdlib';
import { createCardShape } from './cardShape';

type CardGeometryProps = {
  width?: number;
  height?: number;
  thickness?: number;
  radius?: number;
  bevelSize?: number;
};

export function CardGeometry({
  width = 3.5,
  height = 5.25,
  thickness = 0.05,
  radius = 0.3,
  bevelSize = 0.015,
}: CardGeometryProps) {
  const geomRef = useRef<ExtrudeGeometry>(null);

  const shape = useMemo(
    () => createCardShape(width, height, radius),
    [width, height, radius],
  );

  const extrudeSettings = useMemo(
    () => ({
      depth: Math.max(thickness - bevelSize * 2, 0.001),
      bevelEnabled: true,
      bevelThickness: bevelSize,
      bevelSize,
      bevelSegments: 4,
      curveSegments: 12,
    }),
    [thickness, bevelSize],
  );

  useLayoutEffect(() => {
    if (geomRef.current) {
      geomRef.current.center();
      toCreasedNormals(geomRef.current, 0.4);
    }
  }, [shape, extrudeSettings]);

  return <extrudeGeometry ref={geomRef} args={[shape, extrudeSettings]} />;
}
