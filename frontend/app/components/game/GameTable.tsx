import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useControls } from 'leva';
import { Card } from './Card';
import { OpponentHand } from './OpponentHand';
import { PlayerHand } from './PlayerHand';
import { DISCARD_WORLD, seatAngle } from './layout';
import { useLastPlay } from './useLastPlay';
import { cardImage } from './textures';
import type { CardState } from './useHandCards';
import { UseWebSocket } from '~/context/UseWebSocket';
import { OrbitControls } from '@react-three/drei';

/**
 * La scène 3D : la défausse au centre, les mains tout autour.
 *
 * Les joueurs sont répartis à intervalle régulier, le joueur local toujours à
 * l'angle 0 face à la caméra. À deux, l'adversaire se retrouve donc en face.
 */
type GameTableProps = {
  cards: CardState[];
  canPlaySlot: (slot: number) => boolean;
  onPlay: (index: number) => void;
  onArrived: (index: number) => void;
};

export function GameTable({
  cards,
  canPlaySlot,
  onPlay,
  onArrived,
}: GameTableProps) {
  const { gameState, userId } = UseWebSocket();
  const lastPlay = useLastPlay();

  const { lightColor, lightIntensity } = useControls({
    lightColor: 'white',
    lightIntensity: { value: 1.0, min: 0.0, max: 5.0 },
  });

  const lastDiscard =
    gameState?.discardPile?.[gameState.discardPile.length - 1];

  /*
   * Les sièges suivent l'ordre du backend, tourné pour que le joueur local
   * tombe à l'angle 0. Un joueur éliminé n'a plus de main à montrer.
   */
  const me = userId();
  const seated = [...(gameState?.players ?? [])].sort(
    (a, b) => a.seat - b.seat,
  );
  const mySeat = seated.findIndex((p) => p.userId === me);

  const opponents =
    mySeat < 0
      ? []
      : seated
          .map((player, i) => ({
            player,
            angle: seatAngle(
              (i - mySeat + seated.length) % seated.length,
              seated.length,
            ),
          }))
          .filter(
            ({ player }) => player.userId !== me && player.status === 'ACTIVE',
          );

  return (
    <div className="inset-0 fixed">
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
            frontImage={cardImage(lastDiscard)}
            position={DISCARD_WORLD}
            rotation={[-Math.PI / 2, 0, 0]}
          />

          <PlayerHand
            angle={0}
            cards={cards}
            canPlay={canPlaySlot}
            onPlay={onPlay}
            onArrived={onArrived}
          />

          {opponents.map(({ player, angle }) => (
            <OpponentHand
              key={player.userId}
              playerId={player.userId}
              angle={angle}
              lastPlay={lastPlay}
            />
          ))}
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}
