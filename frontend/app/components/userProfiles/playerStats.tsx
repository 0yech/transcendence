import { useEffect, useState } from 'react';
import {
  getPlayerStats,
  type PlayerStats as PlayerStatsData,
} from '~/utils/users';
import {
  accentInsetCardClass,
  eyebrowClass,
  insetCardClass,
  primaryCardClass,
  sectionTitleClass,
  statLabelClass,
} from '~/styles/theme';

type PlayerStatsProps = {
  userId?: string;
};

/**
 * @brief Displays lifetime statistics for a player profile.
 */
export function PlayerStats({ userId }: PlayerStatsProps) {
  const [stats, setStats] = useState<PlayerStatsData | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    setStats(null);
    setHasError(false);

    getPlayerStats(userId)
      .then((data) => {
        if (!cancelled) {
          setStats(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
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
    <section className={primaryCardClass}>
      <div>
        <p className={eyebrowClass}>Performance</p>
        <h2 className={`mt-1 ${sectionTitleClass}`}>Player Stats</h2>
      </div>

      {hasError ? (
        <div className={`${insetCardClass} mt-5 p-5 text-center opacity-60`}>
          Unable to load player stats.
        </div>
      ) : !stats ? (
        <div className={`${insetCardClass} mt-5 p-5 text-center opacity-60`}>
          Loading stats...
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className={`${accentInsetCardClass} p-5`}>
            <p className={statLabelClass}>Win rate</p>

            <p className="mt-1 text-3xl font-black text-pink">
              {stats.winRate.toFixed(1)}%
            </p>

            <p className="mt-2 text-sm font-semibold opacity-60">
              {stats.wins}W / {stats.losses}L
            </p>
          </div>

          <div className={`${insetCardClass} p-5`}>
            <p className={statLabelClass}>Scored games</p>

            <p className="mt-1 text-3xl font-black">
              {stats.scoredGameRate.toFixed(1)}%
            </p>

            <p className="mt-2 text-sm font-semibold opacity-60">
              {stats.gamesWithPoints} / {stats.gamesPlayed}
            </p>
          </div>

          <div className={`${insetCardClass} p-5`}>
            <p className={statLabelClass}>Games played</p>

            <p className="mt-1 text-3xl font-black">{stats.gamesPlayed}</p>
          </div>

          <div className={`${insetCardClass} p-5`}>
            <p className={statLabelClass}>Last played</p>

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
  );
}
