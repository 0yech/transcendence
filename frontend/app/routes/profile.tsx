import apiFetch from '~/utils/api-fetch';
import type { Route } from '../+types/profile';
import { LogoutButton } from '~/auth/logout';

export async function clientLoader() {
  const data = await apiFetch('/api/auth/me');
  return data.json();
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  const { username, email } = loaderData;
  return (
    <>
      <title>{username}'s Profile</title>
      <h1>{username}'s Profile</h1>

      <LogoutButton />

      <h2>Email</h2>
      <div>{email}</div>
    </>
  );
}
