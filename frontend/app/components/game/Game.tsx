import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { useControls } from 'leva';
import { OrbitControls } from '@react-three/drei';
// import { useMotionValue, useSpring } from 'motion/react';
import { Card } from './Card';
import { UseWebSocket } from '~/context/UseWebSocket';
import { useNavigate, useParams } from 'react-router';
import LobbyChat from '~/components/LobbyChat';
import { getUserById } from '~/utils/users';
import { motion } from 'motion/react';

export function Game() {
  const { lightColor, lightIntensity } = useControls({
    lightColor: 'white',
    lightIntensity: {
      value: 1.0,
      min: 0.0,
      max: 5.0,
    },
  });
  {
    /**Début de l'enfer */
  }
  const { playSlot, gameState, userId, playFour, unable } = UseWebSocket();
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [turnUser, setTurnUser] = useState<string | null>(null);
  const navigate = useNavigate();
  const { code } = useParams();

  useEffect(() => {
    if (gameState && gameState.winnerId)
      getUserById(gameState.winnerId).then((json) =>
        setWinnerId(json.username),
      );
  }, [gameState, gameState?.winnerId]);
  useEffect(() => {
    if (gameState && gameState.currentPlayerId)
      getUserById(gameState.currentPlayerId).then((json) =>
        setTurnUser(json.username),
      );
  }, [gameState, gameState?.currentPlayerId]);
  if (!code) {
    return null;
  }

  let myCards = null;
  if (gameState) {
    const players = gameState.players.find(
      (element) => element.userId === userId(),
    );
    console.log(players);
    if (players) {
      myCards = players.hand;
    }
  }
  if (gameState?.winnerId && gameState?.status == 'FINISHED') {
    setTimeout(() => {
      navigate('/');
    }, 10000);
  }

  {
    /**Retour en zone "safe" */
  }

  return (
    <>
      {/**L'enfer 2, le retour de la vengeance */}
      <div className="w-fit h-fit flex flex-col gap-4 fixed top-14">
        <div className="w-fit h-fit flex flex-col gap-4">
          <li>who's turn: {turnUser}</li>
          <li>pendingPlays: {gameState?.pendingPlays}</li>
          <li>turnNumber: {gameState?.turnNumber}</li>
          <li>DeckCount: {gameState?.deckCount}</li>
          <li>
            {gameState?.direction ? <>Left to right</> : <>Right to left</>}
          </li>
          {winnerId ? <li>Winner: {winnerId}</li> : <></>}
          {gameState &&
          gameState.discardPile &&
          gameState.discardPile.length > 0 ? (
            <li>
              LastCardPlayed:{' '}
              {gameState.discardPile[gameState.discardPile.length - 1].id}
            </li>
          ) : (
            <></>
          )}

          {Array.isArray(myCards) ? (
            <>
              <li key="play99">
                <button
                  className="rounded-full w-fit px-5 bg-pink-400 hover:bg-pink-600"
                  onClick={() => playFour()}
                >
                  play Four ONO99
                </button>
              </li>
              <li key="forfeit">
                <button
                  className="rounded-full w-fit px-5 bg-pink-400 hover:bg-pink-600"
                  onClick={() => unable()}
                >
                  Unable to play
                </button>
              </li>
            </>
          ) : (
            <>not waa :(</>
          )}
          <LobbyChat code={code} canSend={true} />
        </div>
      </div>
      {/**Ouf, c'est fini */}
      <div className="inset-0 top-0 h-dvh flex justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: -100 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        >
          <h1 className="text-9xl font-display text-shadow-lg">
            NONO{gameState?.total}
          </h1>
        </motion.div>
      </div>
      <div className="inset-0 fixed">
        {/* eventSource={document.body} eventPrefix="client" */}
        <Canvas>
          <ambientLight intensity={0.2} />
          <directionalLight
            position={[0, 9, 20]}
            color={lightColor}
            intensity={lightIntensity}
          />
          <Suspense fallback={null}>
            <Card
              frontImage={`/cards/${
                gameState &&
                gameState.discardPile &&
                gameState.discardPile.length > 0
                  ? gameState.discardPile[
                      gameState.discardPile.length - 1
                    ].id.slice(
                      0,
                      gameState.discardPile[
                        gameState.discardPile.length - 1
                      ].id.lastIndexOf('_'),
                    )
                  : 'censored'
              }.png`}
              position={[0, 0, -22]}
              rotation={[-Math.PI / 6, 0, 0]}
            />
            <group
              scale={0.3}
              position={[0, -2, 0]}
              rotation={[-Math.PI / 12, 0, 0]}
            >
              <Card
                frontImage={`/cards/${Array.isArray(myCards) ? myCards[0].id.slice(0, myCards[0].id.lastIndexOf('_')) : 'censored'}.png`}
                onClick={(e) => {
                  e.stopPropagation();
                  playSlot(1);
                }}
                position={[-2.1, 0, 0]}
                rotation={[0, Math.PI / 128, Math.PI / 6]}
              />
              <Card
                frontImage={`/cards/${Array.isArray(myCards) ? myCards[1].id.slice(0, myCards[1].id.lastIndexOf('_')) : 'censored'}.png`}
                onClick={(e) => {
                  e.stopPropagation();
                  playSlot(2);
                }}
                position={[-0.7, 0.5, 0]}
                rotation={[0, Math.PI / 128, Math.PI / 12]}
              />
              <Card
                frontImage={`/cards/${Array.isArray(myCards) ? myCards[2].id.slice(0, myCards[2].id.lastIndexOf('_')) : 'censored'}.png`}
                onClick={(e) => {
                  e.stopPropagation();
                  playSlot(3);
                }}
                position={[0.7, 0.5, 0]}
                rotation={[0, Math.PI / 128, -Math.PI / 12]}
              />
              <Card
                frontImage={`/cards/${Array.isArray(myCards) ? myCards[3].id.slice(0, myCards[3].id.lastIndexOf('_')) : 'censored'}.png`}
                onClick={(e) => {
                  e.stopPropagation();
                  playSlot(4);
                }}
                position={[2.1, 0, 0]}
                rotation={[0, Math.PI / 128, -Math.PI / 6]}
              />
            </group>
          </Suspense>
          <OrbitControls />
        </Canvas>
      </div>
    </>
  );
}
