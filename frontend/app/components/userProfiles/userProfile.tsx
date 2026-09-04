import type { UserInterfaceLobby } from '~/utils/lobbies';
import type { SelfUserInterface } from '~/context/WebSocketContext';
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
    : 'Renegade';
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

  return (
    <>
      <title>{user?.username}'s Profile</title>
      <NavBar className="fixed"></NavBar>
      <div className="h-dvh flex flex-col justify-center items-center">
        <div className="text-shadow-lg text-shadow-pink/20 flex flex-col justify-center items-center gap-5 h-fit p-8 rounded-4xl max-w-200 min-w-100 bg-dark-blue/30 shadow-2xl shadow-dark-blue">
          <h1 className="text-7xl font-black w-fit">
            {user?.guild
              ? `${user?.guildRole} of ${user?.guild.name.toUpperCase()}`
              : 'RENAGADE'}
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
      </div>
    </>
  );
}
