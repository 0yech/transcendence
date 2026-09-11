import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { twMerge } from 'tailwind-merge';
import { Button } from '~/components/Button';
import LobbyChat from '~/components/LobbyChat';
import TurnTimer from '~/components/game/TurnTimer';
import { UseWebSocket } from '~/context/UseWebSocket';

/**
 * Tout l'habillage DOM posé par-dessus la scène : l'état de la partie, le total
 * en cours, les actions et le chat.
 *
 * L'overlay couvre l'écran entier mais laisse passer les clics
 * (pointer-events-none) : seuls les panneaux les reprennent, sinon il masquerait
 * les cartes du canvas.
 */

const PANEL =
  'pointer-events-auto bg-dark-blue/20 shadow-dark-blue/30 flex flex-col gap-2 rounded-4xl p-5 shadow-xl backdrop-blur-sm';

const LABEL = 'text-mid-gray text-xs tracking-wider uppercase';

const SEPARATOR = 'my-1 h-1 w-full rounded-full border-0 bg-mid-dark-blue/60';

/*
 * LobbyChat est partagé avec la page lobby et n'a aucun style propre. On le
 * cadre depuis l'extérieur en attendant qu'il soit stylisé pour de bon : sans
 * ça sa liste de messages pousse le champ de saisie hors du panneau.
 */
const CHAT_FRAME = [
  '[&>p:first-child]:text-mid-gray [&>p:first-child]:text-xs [&>p:first-child]:uppercase [&>p:first-child]:tracking-wider',
  '[&_ul]:flex [&_ul]:max-h-40 [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:overflow-y-auto [&_ul]:text-sm',
  '[&_form]:flex [&_form]:gap-2 [&_form]:pt-1',
  '[&_input]:bg-dark-blue/30 [&_input]:min-w-0 [&_input]:flex-1 [&_input]:rounded-full [&_input]:px-3 [&_input]:py-1',
  '[&_form_button]:text-pink [&_form_button]:cursor-pointer [&_form_button]:disabled:opacity-40',
].join(' ');

function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={twMerge(PANEL, className)}>{children}</section>;
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <span className={LABEL}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

/** Le total vire à l'orange puis au rouge à mesure qu'on approche de 99. */
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
    <div className="pointer-events-none fixed inset-0 z-10 top-14 grid grid-rows-[auto_1fr_auto] gap-4 p-4">
      {/* ----- haut : état à gauche, total au centre ----- */}
      <header className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
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

          <hr className={SEPARATOR} />

          <Stat label="Deck" value={gameState?.deckCount ?? '—'} />
          <Stat
            label="Direction"
            value={gameState?.direction === 1 ? '→' : '←'}
          />
          <Stat label="Last played" value={lastDiscard?.label ?? '—'} />

          {gameState?.winnerId && (
            <>
              <hr className={SEPARATOR} />
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

          <hr className={SEPARATOR} />

          {/* Repères de mise au point, à retirer une fois le jeu stabilisé. */}
          <Stat label="Turn number" value={gameState?.turnNumber ?? '—'} />
          <Stat label="Pending plays" value={gameState?.pendingPlays ?? '—'} />
        </Panel>

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

        <div />
      </header>

      {/* la colonne du milieu reste vide : c'est la table */}
      <div />

      {/* ----- bas : actions à gauche, chat à droite ----- */}
      <footer className="flex items-end justify-between gap-4">
        <Panel className="w-64">
          <span className={LABEL}>Actions</span>

          {hasHand ? (
            <>
              <Button
                className="text-base disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                disabled={!canPlayFour}
                onClick={onPlayFour}
              >
                Play four ONO99
              </Button>
              <Button variant="danger" className="text-base" onClick={onUnable}>
                Unable to play
              </Button>
            </>
          ) : (
            <p className="text-mid-gray text-sm">Waiting for cards…</p>
          )}
        </Panel>

        <Panel className={twMerge('w-80', CHAT_FRAME)}>
          <LobbyChat code={code} canSend={true} />
        </Panel>
      </footer>
    </div>
  );
}
