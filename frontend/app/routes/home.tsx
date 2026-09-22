import { useState, useEffect, useRef } from 'react';
import type { Group } from 'three';
import { NavBar } from '~/components/Navbar';
import type { SelfUserInterface } from '~/context/WebSocketContext';
import { ButtonLinkIn } from '~/components/Button';
import { UseWebSocket } from '~/context/UseWebSocket';
import apiFetch from '~/utils/api-fetch';
import { Canvas, useFrame } from '@react-three/fiber';
import { Card } from '~/components/game/Card';
import { OrbitControls } from '@react-three/drei';

/**
 *
 * @brief create a useState for home page. loads it and pass it to Welcome component
 *
 */

function SpinningCard() {
  const groupRef = useRef<Group>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5;
      time.current += delta;
      groupRef.current.position.y = Math.sin(time.current) * 0.1;
    }
  });

  return (
    <group scale={0.8} ref={groupRef}>
      <Card frontImage="/cards/NUMBER_0.png" />
    </group>
  );
}

export default function Home() {
  const { gameStarted, getCode, setUser } = UseWebSocket();
  const lobbyCode = getCode();
  const [userCurr, setUserCurr] = useState<SelfUserInterface | null>(null);
  useEffect(() => {
    async function fetchUser() {
      try {
        const data = await apiFetch('/api/auth/me');
        const json = await data.json();
        if (json && json.username) {
          setUserCurr(json);
        }
      } catch (e) {
        console.log(e);
      }
    }
    fetchUser();
  }, []);

  if (userCurr) setUser(userCurr);
  return (
    <>
      <title>Transcendence</title>
      <NavBar className="fixed"></NavBar>
      <div className="fixed top-0 left-0 h-dvh w-full flex flex-col justify-end items-center">
        <div className="fixed top-0 left-0 w-full h-dvh -z-10">
          <Canvas className="w-full h-full">
            <ambientLight intensity={0.5} />
            <directionalLight position={[0, -10, 5]} intensity={4} />
            <directionalLight position={[0, -10, -5]} intensity={4} />
            <SpinningCard />
            <OrbitControls dampingFactor={0.01} enableZoom={false} />
          </Canvas>
        </div>
        {userCurr?.id ? (
          <div className="flex gap-6 mb-30">
            {/* <ButtonLinkIn className='text-5xl font-black p-6' to="/lobbies">Join Lobby</ButtonLinkIn> */}
            <ButtonLinkIn
              className="text-5xl font-black border-4 border-white p-6"
              to={
                userCurr.lobbyId && lobbyCode
                  ? gameStarted()
                    ? `/game/${lobbyCode}/play`
                    : `/game/${lobbyCode}`
                  : '/lobbies'
              }
            >
              Play Now
            </ButtonLinkIn>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-3 md:gap-6 mb-30">
            <ButtonLinkIn
              className="text-5xl font-black border-4 border-white p-6"
              to="/login"
            >
              Sign In
            </ButtonLinkIn>
            <ButtonLinkIn
              className="text-5xl font-black border-4 border-white p-6"
              to="/register"
            >
              Sign Up
            </ButtonLinkIn>
          </div>
        )}
      </div>
    </>
  );
}
