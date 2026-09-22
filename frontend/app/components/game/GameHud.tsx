import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { twMerge } from 'tailwind-merge';
import { Button } from '~/components/Button';
import LobbyChat from '~/components/LobbyChat';
import TurnTimer from '~/components/game/TurnTimer';
import { UseWebSocket } from '~/context/UseWebSocket';
import { cardStyle, textDiscretStyle, Separator } from '~/styles/style';

/**
 * All the DOM chrome laid over the scene: the state of the game, the running
 * total, the actions and the chat.
 *
 * The overlay covers the whole screen but lets clicks through
 * (pointer-events-none): only the panels take them back, otherwise it would
 * mask the cards on the canvas.
 */

const PANEL = 'pointer-events-auto flex flex-col gap-2';

const LABEL = 'text-xs tracking-wider uppercase not-italic';

function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={twMerge(cardStyle, PANEL, className)}>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <span className={twMerge(textDiscretStyle, LABEL)}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

// The total turns orange then red as it closes in on 99.
function totalTone(total: number): string {
  if (total >= 90)
    return 'text-danger drop-shadow-[0_0_16px_rgba(255,117,117,0.5)]';
  if (total >= 70)
    return 'text-orange drop-shadow-[0_0_16px_rgba(255,183,135,0.4)]';
  return 'text-light-pink drop-shadow-[0_0_16px_rgba(255,145,200,0.4)]';
}

type GameHudProps = {
  code: string;
  hasHand: boolean;
  canPlayFour: boolean;
  onPlayFour: () => void;
  onUnable: () => void;
};

export function GameHud({
  code,
  hasHand,
  canPlayFour,
  onPlayFour,
  onUnable,
}: GameHudProps) {
  const { gameState, userId } = UseWebSocket();

  const users: Record<string, string> = Object.fromEntries(
    (gameState?.players || []).map((user) => [user.userId, user.username]),
  );

  const lastDiscard =
    gameState?.discardPile?.[gameState.discardPile.length - 1];
  const inProgress = gameState?.status === 'IN_PROGRESS';
  const isMyTurn = Boolean(
    gameState?.currentPlayerId && gameState.currentPlayerId === userId(),
  );

  const total = gameState?.total ?? 0;

  return (
    <div className="pointer-events-none fixed inset-0 z-10 top-14">
      <div className="flex justify-between items-start px-4">
        <div className="flex flex-col justify-between gap-4">
          <Panel className="w-64">
            <Stat
              label="Turn"
              value={
                <span className={isMyTurn ? 'text-pink' : undefined}>
                  {isMyTurn
                    ? 'You'
                    : gameState?.currentPlayerId
                      ? (users[gameState.currentPlayerId] ?? '—')
                      : '—'}
                </span>
              }
            />

            {inProgress && gameState?.turnNumber !== undefined && (
              <TurnTimer key={gameState.turnNumber} />
            )}

            <Separator />

            <Stat label="Deck" value={gameState?.deckCount ?? '—'} />
            <Stat
              label="Direction"
              value={gameState?.direction === 1 ? '→' : '←'}
            />
            <Stat label="Last played" value={lastDiscard?.label ?? '—'} />

            {gameState?.winnerId && (
              <>
                <Separator />
                <Stat
                  label="Winner"
                  value={
                    <span className="text-accept">
                      {users[gameState.winnerId] ?? '—'}
                    </span>
                  }
                />
              </>
            )}

            <Separator />

            {/* Debugging readouts, to remove once the game has settled. */}
            <Stat label="Turn number" value={gameState?.turnNumber ?? '—'} />
            <Stat
              label="Pending plays"
              value={gameState?.pendingPlays ?? '—'}
            />
          </Panel>
          <Panel className="w-64">
            <span className={twMerge(textDiscretStyle, LABEL)}>Actions</span>

            {hasHand ? (
              <>
                <Button
                  className="text-base disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                  disabled={!canPlayFour}
                  onClick={onPlayFour}
                >
                  Play four ONO99
                </Button>
                <Button
                  variant="danger"
                  className="text-base"
                  onClick={onUnable}
                >
                  Unable to play
                </Button>
              </>
            ) : (
              <p className={textDiscretStyle}>Waiting for cards…</p>
            )}
          </Panel>
        </div>
        <motion.div
          className="pointer-events-none flex flex-col items-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className={twMerge(LABEL, 'font-display text-base')}>NONO</span>
          <span
            className={twMerge(
              'font-display text-8xl leading-none',
              totalTone(total),
            )}
          >
            {total}
          </span>
        </motion.div>
        {/*
		  The overlay is pointer-events-none so clicks reach the canvas: the
		  chat has to take them back, otherwise it can neither be scrolled nor
		  typed into.
		*/}
        <LobbyChat
          className="pointer-events-auto h-[calc(100vh-7rem)]"
          code={code}
          canSend={true}
        />
      </div>
    </div>
  );
}
