import type { UserInterfaceLobby } from '~/utils/lobbies';

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
