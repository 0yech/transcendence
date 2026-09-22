import { useEffect, useState } from 'react';
import {
  getPlayerStats,
  type PlayerStats as PlayerStatsData,
} from '~/utils/users';
import {
  cardStyle,
  cardDarkStyle,
  textTitle2Style,
  textDiscretStyle,
} from '~/styles/style';
import { twMerge } from 'tailwind-merge';
import { statLabelStyle } from './userProfile';
import { EloProgressionChart } from './playerChart';

type PlayerStatsProps = {
  userId?: string;
};

/** Placeholder shown while loading, or when the request failed. */
function Placeholder({ children }: { children: string }) {
  return (
    <p className={twMerge(cardDarkStyle, textDiscretStyle, 'text-center')}>
      {children}
    </p>
  );
}

/**
 * @brief Displays lifetime statistics for a player profile.
 */
export function PlayerStats({ userId }: PlayerStatsProps) {
  const [stats, setStats] = useState<PlayerStatsData | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    getPlayerStats(userId)
      .then((data) => {
        if (!cancelled) {
          setStats(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStats(null);
          setHasError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const lastPlayedAt = stats?.lastPlayedAt
    ? new Date(stats.lastPlayedAt)
    : null;

  return (
    <>
      <section className={cardStyle}>
        <h2 className={twMerge(textTitle2Style, 'font-bold mb-2')}>Elo</h2>

        {hasError ? (
          <Placeholder>Unable to load player elo.</Placeholder>
        ) : !stats ? (
          <Placeholder>Loading...</Placeholder>
        ) : (
          <EloProgressionChart progression={stats.hourlyProgression} />
        )}
      </section>

      <section className={cardStyle}>
        <h2 className={twMerge(textTitle2Style, 'font-bold mb-2')}>Stats</h2>

        {hasError ? (
          <Placeholder>Unable to load player stats.</Placeholder>
        ) : !stats ? (
          <Placeholder>Loading...</Placeholder>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className={cardDarkStyle}>
              <p className={statLabelStyle}>Win rate</p>
              <p className="mt-1 text-3xl font-black text-pink">
                {stats.winRate.toFixed(1)}%
              </p>
              <p className={textDiscretStyle}>
                {stats.wins}W / {stats.losses}L
              </p>
            </div>

            <div className={cardDarkStyle}>
              <p className={statLabelStyle}>Scored games</p>
              <p className="mt-1 text-3xl font-black text-blue">
                {stats.scoredGameRate.toFixed(1)}%
              </p>
              <p className={textDiscretStyle}>
                {stats.gamesWithPoints} / {stats.gamesPlayed}
              </p>
            </div>

            <div className={cardDarkStyle}>
              <p className={statLabelStyle}>Games played</p>
              <p className="mt-1 text-3xl font-black">{stats.gamesPlayed}</p>
            </div>

            <div className={cardDarkStyle}>
              <p className={statLabelStyle}>Last played</p>
              <p className="mt-1 text-base font-bold">
                {lastPlayedAt
                  ? lastPlayedAt.toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'Never'}
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
