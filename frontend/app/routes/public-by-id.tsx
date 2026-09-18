import apiFetch from '~/utils/api-fetch';
import type { Route } from './+types/public-by-id';
import type { Params } from 'react-router';
import type { SelfUserInterface } from '~/context/WebSocketContext';
import { UserProfile } from '~/components/userProfiles/userProfile';

export async function clientLoader({ params }: { params: Params<string> }) {
  const { id } = params;
  const data = await apiFetch(`/api/users/public/id/${id}`);
  return data.json();
}

export default function PublicProfileById({
  loaderData,
}: Route.ComponentProps) {
  return <UserProfile user={loaderData as SelfUserInterface} />;
}
