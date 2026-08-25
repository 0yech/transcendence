import type { Route } from './+types/profile';
import apiFetch from '~/utils/api-fetch';
import type { Params } from 'react-router';
import { DisplayUsers, JoinLobby, LeaveLobby } from '~/utils/lobbies';
import { useNavigate } from 'react-router';

export async function clientLoader({ params }: { params: Params<string> }) {
  const { code } = params;
  const data = await apiFetch(`/api/lobbies/${code}`);
  return data.json();
}

export default function PreGame({ loaderData }: Route.ComponentProps) {
  console.log(loaderData);
  const { id, code, active, leaderId, createdAt, updatedAt, users, chat } = loaderData;
  const navigate = useNavigate();
  console.log(users);
  console.log(chat);
  return (
    <>
      <li>
        <JoinLobby code={code} />
      </li>
      <li>
        <LeaveLobby />
      </li>
      <li>
        <button onClick={() => navigate('/')}>Home</button>
      </li>
      <br />
      <h2>Id: {id}</h2>
      <h2>Code: {code}</h2>
      <h2>active: {active}</h2>
      <h2>leaderId: {leaderId}</h2>
      <h2>createdAt: {createdAt}</h2>
      <h2>updatedAt: {updatedAt}</h2>
      <h2>Users</h2>
      <DisplayUsers users={users} />
    </>
  );
}
