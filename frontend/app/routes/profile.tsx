import apiFetch from '~/utils/api-fetch';
import { LogoutButton } from '~/pages/auth/logout';
import { RemoveAccountButton } from '~/pages/auth/remove-account';
import type { Route } from './+types/profile';
import { HomeButton } from './home';
import { UseWebSocket } from '~/context/UseWebSocket';

export async function clientLoader() {
  const data = await apiFetch('/api/auth/me');
  return data.json();
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  const { id, username, email, guild, avatarUrl } = loaderData;
  const { setUserId, userId } = UseWebSocket();
  setUserId(id);
  console.log(userId());
  return (
    <>
      <title>{username}'s Profile</title>
      <h1 className="text-3xl font-bold">{username}'s Profile</h1>
      <img src={avatarUrl} />

      <LogoutButton />

      <HomeButton />

      <h2 className="text-2xl font-bold">Email</h2>
      <div>{email}</div>

      <h2 className="text-2xl font-bold">Current Guild</h2>
      <div>{guild?.name || 'No active guild'}</div>
      <RemoveAccountButton />
    </>
  );
}
