import type { SelfUserInterface } from '~/context/WebSocketContext';
import { UserProfile } from '~/components/userProfiles/userProfile';
import apiFetch from '~/utils/api-fetch';
import type { Route } from './+types/profile';

export async function clientLoader() {
  const response = await apiFetch('/api/auth/me');
  return (await response.json()) as SelfUserInterface;
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  return <UserProfile user={loaderData as SelfUserInterface} />;
}
