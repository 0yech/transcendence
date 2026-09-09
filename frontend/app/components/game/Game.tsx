import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { useControls } from 'leva';
import { OrbitControls } from '@react-three/drei';
// import { useMotionValue, useSpring } from 'motion/react';
import { Card } from './Card';
import { UseWebSocket } from '~/context/UseWebSocket';
import { useNavigate, useParams } from 'react-router';
import LobbyChat from '~/components/LobbyChat';
import { motion } from 'motion/react';
import TurnTimer from '~/components/game/TurnTimer';

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
  const { playSlot, gameState, userId, playFour, unable, getCode } =
    UseWebSocket();
  const users: Record<string, string> = Object.fromEntries(
    (gameState?.players || []).map((user) => [user.userId, user.username]),
  );
  const { code } = useParams();
  const lobbyCode = getCode();
  const navigate = useNavigate();

  if (!code) {
    return null;
  }

  let myCards = null;
  if (gameState) {
    const players = gameState.players.find(
      (element) => element.userId === userId(),
    );
    if (players) {
      myCards = players.hand;
    }
  }
  if (gameState?.status == 'FINISHED') {
    setTimeout(() => {
      navigate(`/game/${lobbyCode}`);
    }, 10000);
  }

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
        <Canvas camera={{ position: [0, 25, 35], fov: 50 }}>
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
              position={[0, 0, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
            <group position={[0, 4, 15]} rotation={[-Math.PI / 8, 0, 0]}>
              <Card
                frontImage={`/cards/${Array.isArray(myCards) ? myCards[0].id.slice(0, myCards[0].id.lastIndexOf('_')) : 'censored'}.png`}
                position={[2.1, 0, 0]}
                rotation={[0, Math.PI / 128, Math.PI / 6]}
                onClick={(e) => {
                  e.stopPropagation();
                  playSlot(1);
                }}
              />
              <Card
                frontImage={`/cards/${Array.isArray(myCards) ? myCards[1].id.slice(0, myCards[1].id.lastIndexOf('_')) : 'censored'}.png`}
                position={[-0.7, 0.5, 0]}
                rotation={[0, Math.PI / 128, Math.PI / 12]}
                onClick={(e) => {
                  e.stopPropagation();
                  playSlot(2);
                }}
              />
              <Card
                frontImage={`/cards/${Array.isArray(myCards) ? myCards[2].id.slice(0, myCards[2].id.lastIndexOf('_')) : 'censored'}.png`}
                position={[0.7, 0.5, 0]}
                rotation={[0, Math.PI / 128, -Math.PI / 12]}
                onClick={(e) => {
                  e.stopPropagation();
                  playSlot(3);
                }}
              />
              <Card
                frontImage={`/cards/${Array.isArray(myCards) ? myCards[3].id.slice(0, myCards[3].id.lastIndexOf('_')) : 'censored'}.png`}
                position={[2.1, 0, 0]}
                rotation={[0, Math.PI / 128, -Math.PI / 6]}
                onClick={(e) => {
                  e.stopPropagation();
                  playSlot(4);
                }}
              />
            </group>
          </Suspense>
          <OrbitControls />
        </Canvas>
      </div>
    </>
  );
}
