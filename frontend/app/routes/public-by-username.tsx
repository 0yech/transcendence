import apiFetch from '~/utils/api-fetch';
import type { Route } from './+types/profile';
import type { Params } from 'react-router';

export async function clientLoader({ params }: { params: Params<string> }) {
  const { username } = params;
  console.log('Username: ' + username);
  const data = await apiFetch(`/api/users/public/username/${username}`);
  return data.json();
}

export default function PublicProfileByUsername({
  loaderData,
}: Route.ComponentProps) {
  //const { id,
  //  username,
  //  avatarUrl,
  //  lobbyId,
  //  gamePlayers,
  //  totalPts,
  //  guildId,
  //  sentGuildInvitations,
  //  createdAt,
  //  deleted
  //} = loaderData;

  console.log(loaderData);
}
