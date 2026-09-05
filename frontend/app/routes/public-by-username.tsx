import apiFetch from '~/utils/api-fetch';
import type { Route } from './+types/public-by-username';
import type { Params } from 'react-router';
import type { SelfUserInterface } from '~/context/WebSocketContext';
import { UserProfile } from '~/components/userProfiles/userProfile';

export async function clientLoader({ params }: { params: Params<string> }) {
  const { username } = params;
  console.log('Username: ' + username);
  const data = await apiFetch(`/api/users/public/username/${username}`);
  return data.json();
}

export default function PublicProfileByUsername({
  loaderData,
}: Route.ComponentProps) {
  const user: SelfUserInterface = loaderData;

  console.log(user);

  return <UserProfile user={user} />;
}
