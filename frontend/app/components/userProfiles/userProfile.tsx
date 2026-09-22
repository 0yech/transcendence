import type { UserInterfaceLobby } from '~/utils/lobbies';
import type {
  SelfUserInterface,
  SelfMatchHistory,
} from '~/context/WebSocketContext';
import { Avatar } from '~/components/Avatar';
import { NavBar } from '../Navbar';
import {
  accentInsetCardClass,
  accentPillClass,
  eyebrowClass,
  insetCardClass,
  pageContentClass,
  profilePageShellClass,
  primaryCardClass,
  sectionTitleClass,
  statLabelClass,
} from '~/styles/theme';
import { PlayerStats } from './playerStats';
import { twMerge } from 'tailwind-merge';
import {
  gradientAccentHoverStyle,
  gradientAccentStyle,
  textMaskStyle,
  textParaStyle,
  textTitleStyle,
} from '~/styles/style';

interface UserPopUpProps {
  user: UserInterfaceLobby;
}

export function UserPopUp({ user }: UserPopUpProps) {
  const userRole =
    user.guild && user.guildRole
      ? user.guildRole.charAt(0) + user.guildRole.substring(1).toLowerCase()
      : '';
  const guildTitle = user.guild
    ? `${userRole} of ${user.guild.name}`
    : 'No guild';
  return (
    <div className="flex flex-col mt-2 justify-between">
      <div className="flex justify-between flex-row h-1/2 w-full">
        <div
          className={twMerge(
            textTitleStyle,
            'text-2xl md:text-2xl',
            textMaskStyle,
            gradientAccentStyle,
            gradientAccentHoverStyle,
          )}
        >
          {user.username}
        </div>
        <div className={textParaStyle}>{user.totalPts}</div>
      </div>
      <div className={textParaStyle}>{guildTitle}</div>
    </div>
  );
}

export function UserProfile({ user }: { user: SelfUserInterface | null }) {
  const date = new Date(user?.createdAt ? user?.createdAt : '');

  const userPts = user?.totalPts ?? 0;
  const ranks = [
    { minPts: 0, name: 'Noob' },
    { minPts: 100, name: 'Beginner' },
    { minPts: 850, name: 'Amateur' },
    { minPts: 1500, name: 'Semipro' },
    { minPts: 3000, name: 'Pro' },
    { minPts: 4500, name: 'Legend' },
    { minPts: 8000, name: 'GOAT' },
    { minPts: 31415, name: 'Hacker' },
    { minPts: 1000000, name: 'Nolife' },
  ];
  const rankIndex = ranks.reduce(
    (currentIndex, rank, index) =>
      userPts >= rank.minPts ? index : currentIndex,
    0,
  );
  const currentRank = ranks[rankIndex];
  const nextRank = ranks[rankIndex + 1];
  const userRank = currentRank.name;
  const xpProgress = nextRank
    ? Math.min(
        100,
        Math.max(
          0,
          ((userPts - currentRank.minPts) /
            (nextRank.minPts - currentRank.minPts)) *
            100,
        ),
      )
    : 100;

  return (
    <>
      <title>{user?.username ? `${user.username}'s Profile` : 'Profile'}</title>
      <NavBar className="fixed"></NavBar>
      <main className={profilePageShellClass}>
        <div className={pageContentClass}>
          <section className={primaryCardClass}>
            <p className={eyebrowClass}>Player profile</p>
            <div className="mt-5 flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row sm:text-left">
                <div className="shrink-0 rounded-full bg-linear-to-br from-blue to-pink p-1 shadow-xl shadow-pink/40">
                  <Avatar
                    className="h-36 w-36 sm:h-44 sm:w-44"
                    src={user?.avatarUrl}
                    alt={`Profile of ${user?.username}`}
                  />
                </div>
                <div className="min-w-0 sm:text-left">
                  <h1 className="wrap-break-word text-4xl font-black sm:text-6xl">
                    {user?.guild
                      ? `${user.guildRole} of ${user.guild.name.toUpperCase()}`
                      : 'No guild'}
                  </h1>
                  <p className="mt-2 text-lg font-bold text-light-pink">
                    {user?.username ?? 'Loading profile'}
                  </p>
                </div>
              </div>

              <div className="flex w-full justify-center gap-3 sm:w-auto sm:flex-col sm:items-end">
                <div className="flex flex-row justify-between w-full gap-2">
                  <div
                    className={`${accentInsetCardClass} px-5 py-3 text-center sm:text-right w-1/2`}
                  >
                    <p className={statLabelClass}>Rank</p>
                    <p className="text-3xl font-black text-pink">{userRank}</p>
                  </div>
                  <div
                    className={`${accentInsetCardClass} px-5 py-3 text-center sm:text-right w-1/2`}
                  >
                    <p className={statLabelClass}>Total points</p>
                    <p className="text-3xl font-black text-pink">{userPts}</p>
                  </div>
                </div>
                <div className="w-full">
                  <div className="mb-1 flex items-center justify-between text-xs font-bold text-light-pink">
                    <span>XP</span>
                    <span>
                      {nextRank
                        ? `${userPts} / ${nextRank.minPts}`
                        : 'Max rank'}
                    </span>
                  </div>
                  <div
                    className="h-3 w-full overflow-hidden rounded-full bg-mid-dark-blue/80"
                    role="progressbar"
                    aria-label="Rank progression"
                    aria-valuemin={0}
                    aria-valuemax={nextRank?.minPts ?? userPts}
                    aria-valuenow={userPts}
                  >
                    <div
                      className="h-full rounded-full bg-linear-to-r from-blue to-pink transition-[width] duration-500"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>
                <div
                  className={`${insetCardClass} px-5 py-3 text-center text-sm opacity-75 sm:text-right `}
                >
                  Account created{' '}
                  {Number.isNaN(date.getTime())
                    ? 'recently'
                    : date.toLocaleDateString('en-US', { dateStyle: 'long' })}
                </div>
              </div>
            </div>
          </section>
          <PlayerStats userId={user?.id} />
          <section className={primaryCardClass}>
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className={eyebrowClass}>Recent activity</p>
                <h2 className={`mt-1 ${sectionTitleClass}`}>Match History</h2>
              </div>
              <span className={accentPillClass}>
                {user?.gamePlayers?.length ?? 0}
              </span>
            </div>

            <div className="mt-5 flex flex-col gap-3">
              {user?.gamePlayers?.length ? (
                user.gamePlayers.map((match: SelfMatchHistory) => (
                  <article
                    key={match.id}
                    className={`${insetCardClass} flex items-center justify-between gap-6 p-5 transition-colors hover:bg-pink/10`}
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-xl font-bold sm:text-2xl">
                        {match.eliminatedPosition
                          ? `Eliminated #${match.eliminatedPosition}`
                          : 'Survived'}
                      </h3>
                      <p className="mt-1 text-sm opacity-60">
                        Game ID: {match.game.id}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={
                          (match.pointWon ?? 0) > 0
                            ? 'text-2xl font-black text-pink'
                            : 'text-2xl font-black opacity-70'
                        }
                      >
                        +{match.pointWon} Pts
                      </span>
                      <p className="mt-1 text-sm opacity-60">
                        {new Date(match.game.startedAt).toLocaleString(
                          'en-US',
                          {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          },
                        )}
                      </p>
                    </div>
                  </article>
                ))
              ) : (
                <p
                  className={`${insetCardClass} py-12 text-center text-xl opacity-60`}
                >
                  No games played yet.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
