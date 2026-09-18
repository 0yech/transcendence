import apiFetch from '~/utils/api-fetch';
import type { Route } from './+types/public-by-username';
import type { Params } from 'react-router';
import type { SelfUserInterface } from '~/context/WebSocketContext';
import { UserProfile } from '~/components/userProfiles/userProfile';

export async function clientLoader({ params }: { params: Params<string> }) {
  const { username } = params;
  const data = await apiFetch(`/api/users/public/username/${username}`);
  return data.json();
}

export default function PublicProfileByUsername({
  loaderData,
}: Route.ComponentProps) {
  return <UserProfile user={loaderData as SelfUserInterface} />;
}
