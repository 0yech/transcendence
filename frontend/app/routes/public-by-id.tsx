import apiFetch from '~/utils/api-fetch';
import type { Route } from './+types/profile';
import type { Params } from 'react-router';

export async function clientLoader({ params }: { params: Params<string> }) {
  const { id } = params;
  console.log('id: ' + id);
  const data = await apiFetch(`/api/users/public/id/${id}`);
  return data.json();
}

export default function PublicProfileById({
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
