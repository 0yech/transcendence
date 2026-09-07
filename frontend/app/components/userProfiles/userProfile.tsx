import type { UserInterfaceLobby } from '~/utils/lobbies';
import type {
  SelfUserInterface,
  SelfMatchHistory,
} from '~/context/WebSocketContext';
import { Avatar } from '~/components/Avatar';
import { NavBar } from '../Navbar';

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
        <div className="flex font-bold">{user.username}</div>
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

  console.log(user);
  return (
    <>
      <title>{user?.username}'s Profile</title>
      <NavBar className="fixed"></NavBar>
      <div className="h-dvh flex flex-col justify-center items-center">
        <div className="text-shadow-lg text-shadow-pink/20 flex flex-col justify-center items-center gap-5 h-fit p-8 rounded-4xl max-w-200 min-w-100 bg-dark-blue/30 shadow-2xl shadow-dark-blue">
          <h1 className="text-7xl font-black w-fit">
            {user?.guild
              ? `${user?.guildRole} of ${user?.guild.name.toUpperCase()}`
              : 'NO GUILD'}
          </h1>
          <div className="flex justify-between w-full">
            <div className="flex flex-col justify-between gap-5 items-center h-full">
              <Avatar
                className="shadow-xl shadow-pink/40 w-50 h-50"
                src={user?.avatarUrl}
                alt={`Profile of ${user?.username}`}
              ></Avatar>
              <h2 className="h-full text-center text-3xl font-bold">
                {user?.username}
              </h2>
            </div>
            <div className="flex h-full flex-col justify-between items-end">
              <h2 className="italic">{user?.totalPts} Pts</h2>
              {/* <p>email: {user?.email}</p> */}
              <p className="text-center">
                Account created on{' '}
                {date.toLocaleString('en-US', {
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="text-shadow-lg text-shadow-pink/20 flex flex-col gap-5 p-8 rounded-4xl max-w-200 min-w-100 w-full bg-dark-blue/30 shadow-2xl shadow-dark-blue mt-5">
          <h2 className="text-4xl font-black">Match History</h2>

          <div className="flex flex-col gap-3">
            {user?.gamePlayers?.length ? (
              user.gamePlayers.map((match: SelfMatchHistory) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between gap-6 p-5 rounded-3xl bg-dark-blue/40 shadow-lg shadow-dark-blue/30"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <h3 className="text-2xl font-bold truncate">
                      {match.eliminatedPosition
                        ? `Eliminated #${match.eliminatedPosition}`
                        : 'Survived'}
                    </h3>

                    <p className="text-sm opacity-70">
                      Game ID: {match.game.id}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-2xl font-black ${
                        (match.pointWon ?? 0) > 0 ? 'text-pink' : 'opacity-70'
                      }`}
                    >
                      +{match.pointWon} Pts
                    </span>

                    {match.eliminatedAt && (
                      <span className="text-sm opacity-60">
                        {new Date(match.eliminatedAt).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center opacity-60 py-6">
                No games played yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
