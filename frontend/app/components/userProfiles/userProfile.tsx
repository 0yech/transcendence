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
    <div className="flex flex-col m-2 justify-between">
      <div className="flex justify-between flex-row h-1/2 w-full">
        <div className="flex font-bold hover:text-pink hover:underline hover:decoration-pink">
          {user.username}
        </div>
        <div className="flex ">{user.totalPts}</div>
      </div>
      <div className="flex underline text-light-gray font-extralight italic">
        {guildTitle}
      </div>
    </div>
  );
}

export function UserProfile({ user }: { user: SelfUserInterface | null }) {
  const date = new Date(user?.createdAt ? user?.createdAt : '');

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
                <div
                  className={`${accentInsetCardClass} px-5 py-3 text-center sm:text-right`}
                >
                  <p className={statLabelClass}>Total points</p>
                  <p className="text-3xl font-black text-pink">
                    {user?.totalPts ?? 0}
                  </p>
                </div>
                <div
                  className={`${insetCardClass} px-5 py-3 text-center text-sm opacity-75 sm:text-right`}
                >
                  Account created{' '}
                  {Number.isNaN(date.getTime())
                    ? 'recently'
                    : date.toLocaleDateString('en-US', { dateStyle: 'long' })}
                </div>
              </div>
            </div>
          </section>

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
