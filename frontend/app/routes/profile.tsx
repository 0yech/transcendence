import apiFetch from '~/utils/api-fetch';
import type { Route } from '../+types/profile';
import { LogoutButton } from '~/auth/logout';

export async function clientLoader() {
  const data = await apiFetch('/api/auth/me');
  return data.json();
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  const { username, email, guildId } = loaderData;
  return (
    <>
      <title>{username}'s Profile</title>
      <h1 className="text-3xl font-bold">{username}'s Profile</h1>

      <LogoutButton />

      <h2 className="text-2xl font-bold">Email</h2>
      <div>{email}</div>

      <h2 className="text-2xl font-bold">Current Guild</h2>
      <div>{guildId || 'No active guild'}</div>
    </>
  );
}
