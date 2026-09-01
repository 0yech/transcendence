import apiFetch from '~/utils/api-fetch';
import { LogoutButton } from '~/pages/auth/logout';
import { RemoveAccountButton } from '~/pages/auth/remove-account';
import type { Route } from './+types/profile';
import { HomeButton } from './home';
import { UseWebSocket } from '~/context/UseWebSocket';
import { useNavigate } from 'react-router';
import ProfilePicture from '~/components/ProfilePicture';

export async function clientLoader() {
  const data = await apiFetch('/api/auth/me');
  return data.json();
}

export default function Profile({ loaderData }: Route.ComponentProps) {
  const {
    id,
    username,
    avatarUrl,
    email,
    guild,
    // lobbyId,
    // gamePlayers,
    // totalPts,
    // sentGuildInvitations,
    // createdAt
  } = loaderData;
  const { setUserId, userId } = UseWebSocket();
  const navigate = useNavigate();
  setUserId(id);
  console.log(userId());
  console.log(loaderData);
  return (
    <>
      <title>{username}'s Profile</title>
      <h1 className="text-3xl font-bold">{username}'s Profile</h1>
      <ProfilePicture avatarUrl={avatarUrl} username={username} />

      <LogoutButton />

      <HomeButton />

      <h2 className="text-2xl font-bold">Email</h2>
      <div>{email}</div>

      <h2 className="text-2xl font-bold">Current Guild</h2>
      <li>
        <button onClick={() => navigate('/guilds/me')}>
          {guild?.name || 'No active guild'}
        </button>
      </li>
      <RemoveAccountButton />
    </>
  );
}
