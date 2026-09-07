import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { ShaderMaterial, Vector4, Vector2, Color } from 'three';
import { useControls, folder } from 'leva';
import { OrbitControls, useAspect } from '@react-three/drei';
import { vertex, fragment } from './shaders/shader';
// import {
//   EffectComposer,
//   ChromaticAberration,
// } from '@react-three/postprocessing';
import { useMotionValue, useSpring } from 'motion/react';
// import { BlendFunction } from 'postprocessing'

// const Cube = ( {...rest} ) => {
// 	const ref = useRef<Mesh>(null);
// 	const [isHovered, setIsHovered] = useState<boolean>(false);
// 	const tex = useTexture('/background.png')

// 	useFrame((_, delta) => {
// 		if (ref.current && !isHovered) {
// 			ref.current.rotation.x += delta;
// 			ref.current.rotation.y += delta;
// 		}
// 	})

// 	const {transmission, thickness, ior, chromaticAberation, roughness, scale} = useControls({
// 		transmissionMaterial: folder({
// 		transmission: {
// 			value: 1.0,
// 			min: 0.0,
// 			max: 1.0,
// 		},
// 		thickness: {
// 			value: 0.5,
// 			min: 1.15,
// 			max: 5.0,
// 		},
// 		ior: {
// 			value: 2.0,
// 			min: 1.0,
// 			max: 2.5,
// 		},
// 		chromaticAberation: {
// 			value: 0.3,
// 			min: 0.0,
// 			max: 0.5,
// 		},
// 		roughness: {
// 			value: 0.1,
// 			min: 0.0,
// 			max: 1.0,
// 		},
// 		scale: {
// 			value: 1.0,
// 			min: 0.5,
// 			max: 5.0,
// 		},
// 		})
// 	})

// 	return (
// 		<mesh scale={scale} ref={ref} {...rest} onPointerEnter={(e) => { e.stopPropagation(); setIsHovered(true); console.log("hover") }} onPointerLeave={() => setIsHovered(false)}>
// 			<boxGeometry/>
// 			<MeshTransmissionMaterial
// 				background={tex}
//   			  transmission={transmission}
//   			  thickness={thickness}
//   			  ior={ior}
//   			  chromaticAberration={chromaticAberation}
//   			  roughness={roughness}
//   			  backside
//   			/>
// 		</mesh>
// 	);
// }

const ConvertColor = (hex: string, position: number) => {
  const col = new Color(hex);
  return new Vector4(col.r, col.g, col.b, position);
};

// const ConvertColor = (hex: string, position: number) => {
//   const n = parseInt(hex.slice(1), 16)
//   return new Vector4(
//     ((n >> 16) & 255) / 255,
//     ((n >>  8) & 255) / 255,
//     ( n        & 255) / 255,
//     position,
//   )
// }

const WavesPlane = () => {
  const aspect = useAspect(1, 1, 1.0);
  const mat = useRef<ShaderMaterial>(null);

  const mouse = {
    x: useMotionValue(0),
    y: useMotionValue(0),
  };

  const smoothOptions = { damping: 10, stiffness: 300, mass: 0.2 };
  const smoothMouse = {
    x: useSpring(mouse.x, smoothOptions),
    y: useSpring(mouse.y, smoothOptions),
  };
  const ctl = useControls({
    shaderControl: folder({
      frequency: { value: 18.0, min: 0.0, max: 100.0 },
      amplitude: { value: 2.3, min: 0.0, max: 5.0 },
      speed: { value: 0.9, min: 0.0, max: 5.0 },
      size: { value: 3.0, min: 0.5, max: 6.0 },
      vertexNumber: { value: 128, min: 1, max: 1024, step: 1 },
      wireframe: { value: false },
      rotation: folder({
        x: { value: -0.6, min: -Math.PI, max: Math.PI },
        y: { value: 0.0, min: -Math.PI, max: Math.PI },
        z: { value: 0.0, min: -Math.PI, max: Math.PI },
      }),
      position: folder({
        px: { value: 0.0, min: -10.0, max: 10.0 },
        py: { value: 6.0, min: -10.0, max: 10.0 },
        pz: { value: -5.0, min: -10.0, max: 10.0 },
      }),
      color0: folder({
        c0: '#777df2',
        p0: { value: 0.0, min: 0, max: 1, step: 0.01 },
      }),
      color1: folder({
        c1: '#aafff0',
        p1: { value: 0.35, min: 0, max: 1, step: 0.01 },
      }),
      color2: folder({
        c2: '#fff5aa',
        p2: { value: 0.62, min: 0, max: 1, step: 0.01 },
      }),
      color3: folder({
        c3: '#ffb787',
        p3: { value: 0.82, min: 0, max: 1, step: 0.01 },
      }),
      color4: folder({
        c4: '#ff91c8',
        p4: { value: 1.0, min: 0, max: 1, step: 0.01 },
      }),
    }),
  });

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
    }),
    [],
  );

  useFrame((_, delta) => {
    if (!mat.current) return;
    const u = mat.current.uniforms;
    u.uFrequency.value = ctl.frequency;
    u.uAmplitude.value = ctl.amplitude;
    u.uTime.value += delta * ctl.speed;
    const col = u.uColors.value as Vector4[];
    const hex = [ctl.c0, ctl.c1, ctl.c2, ctl.c3, ctl.c4];
    const pos = [ctl.p0, ctl.p1, ctl.p2, ctl.p3, ctl.p4];
    for (let i = 0; i < 5; ++i) {
      col[i] = ConvertColor(hex[i], pos[i]);
    }
  });

  return (
    <mesh
      scale={aspect}
      onPointerMove={(e) => {
        if (e.uv) {
          uniforms.uCursor.value.copy(
            new Vector2(smoothMouse.x.get(), smoothMouse.y.get()),
          );
          mouse.x.set(e.uv.x);
          mouse.y.set(e.uv.y);
        }
      }}
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
      {/* <EffectComposer>
  	  	<ChromaticAberration offset={new Vector2(0.005, 0.005)} radialModulation modulationOffset={0.015} />
  	</EffectComposer> */}
    </mesh>
  );
};

export function MyCanvas() {
  const { lightColor, lightIntensity } = useControls({
    lightColor: 'white',
    lightIntensity: {
      value: 0.5,
      min: 0.0,
      max: 5.0,
    },
  });

  return (
    <div className="inset-0 fixed">
      <Canvas>
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[0, 0, 2]}
          color={lightColor}
          intensity={lightIntensity}
        />
        {/* <Cube /> */}
        <WavesPlane />
        <OrbitControls />
      </Canvas>
    </div>
  );
}
