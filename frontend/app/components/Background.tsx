import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useSyncExternalStore } from 'react';
import {
  ShaderMaterial,
  Vector4,
  Vector2,
  Color,
  Mesh,
  Raycaster,
} from 'three';
import { useAspect } from '@react-three/drei';
import { vertex, fragment } from './shaders/shader';
import { useMotionValue, useSpring } from 'motion/react';
import {
  EffectComposer,
  ChromaticAberration,
} from '@react-three/postprocessing';

const ConvertColor = (hex: string, position: number) => {
  const col = new Color(hex);
  return new Vector4(col.r, col.g, col.b, position);
};

/**
 * Shader settings, tweak them here.
 *
 * Each onde is (x, y, speed, freq), each color a hex paired with its position
 * along the gradient (0 to 1).
 */
const ctl = {
  frequency: 25.0,
  amplitude: 2.5,
  speed: 0.2,
  size: 6.0,
  vertexNumber: 128,
  wireframe: false,

  // rotation
  x: -1.6,
  y: 0.0,
  z: 0.0,

  // position
  px: 0.0,
  py: -2.2,
  pz: -1.6,

  ondeX1: 0.27,
  ondeY1: -0.5,
  ondeSpeed1: 0.52,
  ondeFreq1: 1.414,

  ondeX2: -0.5,
  ondeY2: -1.6,
  ondeSpeed2: 0.39,
  ondeFreq2: 1.732,

  ondeX3: -0.31,
  ondeY3: 1.5,
  ondeSpeed3: 0.81,
  ondeFreq3: 2.236,

  ondeX4: -1.96,
  ondeY4: 4.86,
  ondeSpeed4: 1.09,
  ondeFreq4: 2.646,

  c0: '#777df2',
  p0: 0.0,
  c1: '#ff91c8',
  p1: 0.33,
  c2: '#ffb787',
  p2: 0.59,
  c3: '#aafff0',
  p3: 0.82,
  c4: '#fff5aa',
  p4: 1.0,
};

const WavesPlane = () => {
  const aspect = useAspect(1, 1, 1.0);
  const mat = useRef<ShaderMaterial>(null);
  const mesh = useRef<Mesh>(null!);
  const { camera } = useThree();

  const ray = useMemo(() => new Raycaster(), []);

  const mouse = {
    x: useMotionValue(0),
    y: useMotionValue(0),
  };

  const smoothOptions = { damping: 9, stiffness: 150, mass: 0.5 };
  const smoothMouse = {
    x: useSpring(mouse.x, smoothOptions),
    y: useSpring(mouse.y, smoothOptions),
  };
  const uniforms = useMemo(
    () => ({
      uFrequency: { value: 1.0 },
      uAmplitude: { value: 0.0 },
      uTime: { value: 0.0 },
      uCursor: { value: new Vector2(0.5, 0.5) },
      uColors: {
        value: [
          ConvertColor('#05081f', 0.0),
          ConvertColor('#0f3866', 0.35),
          ConvertColor('#298a8c', 0.62),
          ConvertColor('#c77552', 0.82),
          ConvertColor('#f8e1b8', 1.0),
        ],
      },
      uOndes: {
        value: [
          new Vector4(1.0, 1.0, 0.0, 0.0),
          new Vector4(0.0, 0.0, 0.0, 0.0),
          new Vector4(1.0, 0.0, 0.0, 0.0),
          new Vector4(0.0, 1.0, 0.0, 0.0),
        ],
      },
    }),
    [],
  );

  const tmpCol = useMemo(() => new Color(), []);

  useFrame((state, delta) => {
    if (!mat.current) return;
    const u = mat.current.uniforms;
    u.uFrequency.value = ctl.frequency;
    u.uAmplitude.value = ctl.amplitude;
    u.uTime.value += delta * ctl.speed;
    const col = u.uColors.value as Vector4[];
    const hex = [ctl.c0, ctl.c1, ctl.c2, ctl.c3, ctl.c4];
    const pos = [ctl.p0, ctl.p1, ctl.p2, ctl.p3, ctl.p4];
    for (let i = 0; i < 5; ++i) {
      tmpCol.set(hex[i]);
      col[i].set(tmpCol.r, tmpCol.g, tmpCol.b, pos[i]);
    }
    const ondes = u.uOndes.value as Vector4[];
    ondes[0].set(ctl.ondeX1, ctl.ondeY1, ctl.ondeFreq1, ctl.ondeSpeed1);
    ondes[1].set(ctl.ondeX2, ctl.ondeY2, ctl.ondeFreq2, ctl.ondeSpeed2);
    ondes[2].set(ctl.ondeX3, ctl.ondeY3, ctl.ondeFreq3, ctl.ondeSpeed3);
    ondes[3].set(ctl.ondeX4, ctl.ondeY4, ctl.ondeFreq4, ctl.ondeSpeed4);
    ray.setFromCamera(state.pointer, camera);
    const hits = ray.intersectObject(mesh.current);
    if (hits.length > 0 && hits[0].uv) {
      mouse.x.set(hits[0].uv.x);
      mouse.y.set(hits[0].uv.y);
    }
    u.uCursor.value.set(smoothMouse.x.get(), smoothMouse.y.get());
  });

  return (
    <mesh
      scale={aspect}
      ref={mesh}
      position={[ctl.px, ctl.py, ctl.pz]}
      rotation={[ctl.x, ctl.y, ctl.z]}
    >
      <planeGeometry
        args={[ctl.size, ctl.size, ctl.vertexNumber, ctl.vertexNumber]}
      />
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        wireframe={ctl.wireframe}
      />
    </mesh>
  );
};

const subscribeNoop = () => () => {};

export function Background() {
  const hydrated = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
  const source = hydrated ? document.body : undefined;

  return (
    <div className="inset-0 fixed -z-50">
      <Canvas eventSource={source} eventPrefix="client">
        <WavesPlane />
        <EffectComposer>
          <ChromaticAberration
            offset={new Vector2(0.005, 0.005)}
            radialModulation
            modulationOffset={0.005}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
