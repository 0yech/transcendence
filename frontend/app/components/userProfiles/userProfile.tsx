import type { UserInterfaceLobby } from '~/utils/lobbies';
import type {
  SelfUserInterface,
  SelfMatchHistory,
} from '~/context/WebSocketContext';
import { Avatar } from '~/components/Avatar';
import { NavBar } from '../Navbar';
import { PlayerStats } from './playerStats';
import { twMerge } from 'tailwind-merge';
import {
  cardStyle,
  cardDarkStyle,
  gradientAccentHoverStyle,
  gradientAccentStyle,
  gradientStyle,
  textMaskStyle,
  textParaStyle,
  textDiscretStyle,
  textTitleStyle,
  textTitle2Style,
} from '~/styles/style';

/* Label above a big number. */
export const statLabelStyle =
  'text-xs font-bold uppercase tracking-wider text-light-pink';

/** Ranks a player walks through as they earn points. */
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
  const rankIndex = ranks.reduce(
    (currentIndex, rank, index) =>
      userPts >= rank.minPts ? index : currentIndex,
    0,
  );
  const currentRank = ranks[rankIndex];
  const nextRank = ranks[rankIndex + 1];
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

      <main className="pt-30 pb-10 px-4 min-h-dvh w-full flex flex-col items-center">
        <h1
          className={twMerge(
            textTitleStyle,
            'uppercase mb-5 text-center wrap-break-word',
          )}
        >
          {user?.username ?? 'Profile'}
        </h1>

        <div className="w-full max-w-5xl flex flex-col gap-4">
          <section
            className={twMerge(
              cardStyle,
              'flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between',
            )}
          >
            <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row">
              <div
                className={twMerge(
                  gradientStyle,
                  'shrink-0 rounded-full p-1 shadow-xl shadow-pink/40',
                )}
              >
                <Avatar
                  className="h-36 w-36 sm:h-44 sm:w-44"
                  src={user?.avatarUrl}
                  alt={`Profile of ${user?.username}`}
                />
              </div>

              <div className="min-w-0 sm:text-left">
                <h2 className={twMerge(textTitle2Style, 'wrap-break-word')}>
                  {user?.guild
                    ? `${user.guildRole} of ${user.guild.name.toUpperCase()}`
                    : 'No guild'}
                </h2>
                <p className={textParaStyle}>
                  Elo{' '}
                  <span className="font-bold text-pink">
                    {user?.elo ? user.elo.toFixed(0) : '-'}
                  </span>
                </p>
                <p className={textDiscretStyle}>
                  Joined{' '}
                  {Number.isNaN(date.getTime())
                    ? 'recently'
                    : date.toLocaleDateString('en-US', { dateStyle: 'long' })}
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-90">
              <div className="flex gap-3">
                <div className={twMerge(cardDarkStyle, 'w-3/4')}>
                  <p className={statLabelStyle}>Rank</p>
                  <p className="text-3xl font-black text-pink">
                    {currentRank.name}
                  </p>
                </div>
                <div className={twMerge(cardDarkStyle, 'w-3/4')}>
                  <p className={statLabelStyle}>Points</p>
                  <p className="text-3xl font-black text-blue">{userPts}</p>
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs font-bold text-light-pink">
                  <span>XP</span>
                  <span>
                    {nextRank ? `${userPts} / ${nextRank.minPts}` : 'Max rank'}
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
                    className={twMerge(
                      gradientStyle,
                      'h-full rounded-full transition-[width] duration-500',
                    )}
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <PlayerStats userId={user?.id} />

          <section className={cardStyle}>
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <h2 className={twMerge(textTitle2Style, 'font-bold')}>
                Match History
              </h2>
              <span className="rounded-full bg-pink/20 px-3 py-1 text-sm font-bold text-light-pink">
                {user?.gamePlayers?.length ?? 0}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {user?.gamePlayers?.length ? (
                user.gamePlayers.map((match: SelfMatchHistory) => (
                  <article
                    key={match.id}
                    className={twMerge(
                      cardDarkStyle,
                      'flex items-center justify-between gap-6 transition-colors hover:bg-pink/10',
                    )}
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-xl font-bold sm:text-2xl">
                        {match.eliminatedPosition
                          ? `Eliminated #${match.eliminatedPosition}`
                          : 'Survived'}
                      </h3>
                      <p className={textDiscretStyle}>
                        {new Date(match.game.startedAt).toLocaleString(
                          'en-US',
                          {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          },
                        )}
                      </p>
                    </div>

                    <span
                      className={twMerge(
                        'shrink-0 text-2xl font-black',
                        (match.pointWon ?? 0) > 0 ? 'text-blue' : 'opacity-70',
                      )}
                    >
                      +{match.pointWon} Pts
                    </span>
                  </article>
                ))
              ) : (
                <p className={twMerge(textDiscretStyle, 'py-12 text-center')}>
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
