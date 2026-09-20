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
import { useControls, folder } from 'leva';
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
  const ctl = useControls({
    shaderControl: folder({
      frequency: { value: 25.0, min: 0.0, max: 100.0 },
      amplitude: { value: 2.5, min: 0.0, max: 5.0 },
      speed: { value: 0.2, min: 0.0, max: 5.0 },
      noise: { value: 0.0, min: 0.0, max: 1.0 },
      size: { value: 6.0, min: 0.5, max: 6.0 },
      vertexNumber: { value: 128, min: 1, max: 1024, step: 1 },
      wireframe: { value: false },
      rotation: folder({
        x: { value: -1.6, min: -Math.PI, max: Math.PI },
        y: { value: 0.0, min: -Math.PI, max: Math.PI },
        z: { value: 0.0, min: -Math.PI, max: Math.PI },
      }),
      position: folder({
        px: { value: 0.0, min: -10.0, max: 10.0 },
        py: { value: -2.2, min: -10.0, max: 10.0 },
        pz: { value: -1.6, min: -10.0, max: 10.0 },
      }),
      onde1: folder({
        ondeX1: { value: 0.27, min: -10.0, max: 10.0, step: 0.001 },
        ondeY1: { value: -0.5, min: -10.0, max: 10.0, step: 0.001 },
        ondeSpeed1: { value: 0.52, min: -5.0, max: 5.0, step: 0.001 },
        ondeFreq1: { value: 1.414, min: -5.0, max: 5.0, step: 0.001 },
      }),
      onde2: folder({
        ondeX2: { value: -0.5, min: -10.0, max: 10.0, step: 0.001 },
        ondeY2: { value: -1.6, min: -10.0, max: 10.0, step: 0.001 },
        ondeSpeed2: { value: 0.39, min: -5.0, max: 5.0, step: 0.001 },
        ondeFreq2: { value: 1.732, min: -5.0, max: 5.0, step: 0.001 },
      }),
      onde3: folder({
        ondeX3: { value: -0.31, min: -10.0, max: 10.0, step: 0.001 },
        ondeY3: { value: 1.5, min: -10.0, max: 10.0, step: 0.001 },
        ondeSpeed3: { value: 0.81, min: -5.0, max: 5.0, step: 0.001 },
        ondeFreq3: { value: 2.236, min: -5.0, max: 5.0, step: 0.001 },
      }),
      onde4: folder({
        ondeX4: { value: -1.96, min: -10.0, max: 10.0, step: 0.001 },
        ondeY4: { value: 4.86, min: -10.0, max: 10.0, step: 0.001 },
        ondeSpeed4: { value: 1.09, min: -5.0, max: 5.0, step: 0.001 },
        ondeFreq4: { value: 2.646, min: -5.0, max: 5.0, step: 0.001 },
      }),
      color0: folder({
        c0: '#777df2',
        p0: { value: 0.0, min: 0, max: 1, step: 0.01 },
      }),
      color1: folder({
        c1: '#ff91c8',
        p1: { value: 0.33, min: 0, max: 1, step: 0.01 },
      }),
      color2: folder({
        c2: '#ffb787',
        p2: { value: 0.59, min: 0, max: 1, step: 0.01 },
      }),
      color3: folder({
        c3: '#aafff0',
        p3: { value: 0.82, min: 0, max: 1, step: 0.01 },
      }),
      color4: folder({
        c4: '#fff5aa',
        p4: { value: 1.0, min: 0, max: 1, step: 0.01 },
      }),
    }),
  });

  const uniforms = useMemo(
    () => ({
      uFrequency: { value: 1.0 },
      uAmplitude: { value: 0.0 },
      uTime: { value: 0.0 },
      uNoise: { value: 0.0 },
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
    u.uNoise.value = ctl.noise;
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
      {/* eventSource={document.body} eventPrefix="client" */}
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
