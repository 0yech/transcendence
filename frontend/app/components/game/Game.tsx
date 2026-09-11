import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useControls } from 'leva';
import { useTexture } from '@react-three/drei';
// import { useMotionValue, useSpring } from 'motion/react';
import { Card } from './Card';
import { Group } from 'three';
import { UseWebSocket } from '~/context/UseWebSocket';
import { useNavigate, useParams } from 'react-router';
import LobbyChat from '~/components/LobbyChat';
import { motion } from 'motion/react';
import TurnTimer from '~/components/game/TurnTimer';

type CardState = {
  slot: number;
  phase: 'idle' | 'toDiscard' | 'fromDeck';
};

function preloadCardsImages() {
  useTexture.preload('/cards/censored.png');
  useTexture.preload('/cards/back.png');
  useTexture.preload(`/cards/MINUS_TEN_-10.png`);
  useTexture.preload(`/cards/ONO99_ONO99.png`);
  useTexture.preload(`/cards/PLAY_TWO_Play2.png`);
  useTexture.preload(`/cards/REVERSE_Reverse.png`);
  for (let i = 0; i <= 10; i++) useTexture.preload(`/cards/NUMBER_${i}.png`);
}

preloadCardsImages();

function cardName(card: { id: string } | undefined) {
  if (!card || !card.id) return 'censored';
  return card.id.slice(0, card.id.lastIndexOf('_'));
}

export function Game() {
  const cardsRef = useRef<Group[]>([]);
  const [cards, setCards] = useState<CardState[]>([
    { slot: 1, phase: 'idle' },
    { slot: 2, phase: 'idle' },
    { slot: 3, phase: 'idle' },
    { slot: 4, phase: 'idle' },
  ]);
  const stepsRotation = [-2, -1, 1, 2];
  const stepsPosition = [1, 2, -2, -1];

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
  const { playSlot, gameState, userId, playFour, unable, getCode } =
    UseWebSocket();
  const users: Record<string, string> = Object.fromEntries(
    (gameState?.players || []).map((user) => [user.userId, user.username]),
  );
  const { code } = useParams();
  const lobbyCode = getCode();
  const navigate = useNavigate();

  useEffect(() => {
    if (gameState?.status === 'FINISHED') {
      const id = setTimeout(() => navigate(`/game/${lobbyCode}`), 10000);
      if (id) return () => clearTimeout(id);
    }
  }, [gameState?.status, navigate, lobbyCode]);

  // useFrame((_, delta) => {
  //   const card =
  // })

  if (!code) {
    return null;
  }

  let myCards = undefined;
  if (gameState) {
    const players = gameState.players.find(
      (element) => element.userId === userId(),
    );
    if (players) {
      myCards = players.hand;
    }
  }
  const hand = Array.isArray(myCards) ? myCards : [];

  {
    /**Retour en zone "safe" */
  }

  return (
    <>
      {/**L'enfer 2, le retour de la vengeance */}
      <div className="w-fit h-fit flex flex-col gap-4 fixed top-14 z-10">
        <div className="w-fit h-fit flex flex-col gap-4">
          {gameState && gameState.currentPlayerId ? (
            <li>who's turn: {users[gameState.currentPlayerId]}</li>
          ) : (
            <></>
          )}
          <li>pendingPlays: {gameState?.pendingPlays}</li>
          <li>turnNumber: {gameState?.turnNumber}</li>
          <li>DeckCount: {gameState?.deckCount}</li>
          {gameState?.status === 'IN_PROGRESS' &&
            gameState.turnNumber !== undefined && (
              <TurnTimer key={gameState.turnNumber} />
            )}
          <li>
            {gameState?.direction ? <>Left to right</> : <>Right to left</>}
          </li>
          {gameState && gameState.winnerId ? (
            <li>Winner: {users[gameState.winnerId]}</li>
          ) : (
            <></>
          )}
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

          {hand.length > 0 ? (
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
        <Canvas camera={{ position: [0, 25, 35], fov: 50 }}>
          <ambientLight intensity={0.2} />
          <directionalLight
            position={[0, 9, 20]}
            color={lightColor}
            intensity={lightIntensity}
          />
          <Suspense fallback={null}>
            <Card
              key="discardPile"
              frontImage={`/cards/${
                gameState &&
                cardName(
                  gameState.discardPile[gameState.discardPile.length - 1],
                )
              }.png`}
              position={[0, 0, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
            <group position={[0, 4, 15]} rotation={[-Math.PI / 8, 0, 0]}>
              {Array.from({ length: 4 }, (_, i) => {
                return (
                  <Card
                    key={`card${i}`}
                    ref={(el) => {
                      if (el) cardsRef.current[i] = el;
                    }}
                    frontImage={`/cards/${cardName(hand?.[i])}.png`}
                    position={[
                      1.1 * stepsPosition[i],
                      0.5 * (Math.abs(stepsRotation[i]) - 1),
                      0,
                    ]}
                    rotation={[
                      0,
                      Math.PI / 128,
                      Math.PI / (stepsRotation[i] * 6),
                    ]}
                    onClick={(e) => {
                      e.stopPropagation();
                      playSlot(cards[i].slot);
                    }}
                  />
                );
              })}
            </group>
          </Suspense>
          {/* <OrbitControls /> */}
        </Canvas>
      </div>
    </>
  );
}
