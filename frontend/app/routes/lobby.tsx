import type { Route } from './+types/profile';
import apiFetch from '~/utils/api-fetch';
import type { Params } from 'react-router';
import { DisplayUsers, JoinLobby, LeaveLobby } from '~/utils/lobbies';
import { useNavigate } from 'react-router';
import { UseWebSocket } from '~/context/UseWebSocket';

export async function clientLoader({ params }: { params: Params<string> }) {
  const { code } = params;
  const data = await apiFetch(`/api/lobbies/${code}`);
  return data.json();
}

/**
 * @brief Component that display all the information about a lobby
 * @brief it takes loaderData as a parameter and allows for easy displaying
 *
 * @param loaderData : Contains the Object
 * @param loaderData.id : Contains de ID of the lobby
 * @param loaderData.code : Contains the code
 * @param loaderData.active : Boolean for if lobby is active
 * @param loaderData.leaderId : Contains the id of the current leader
 * @param loaderData.createdAt : Timestamp of the lobby creation date
 * @param loaderData.updatedAt : Timestamp of the lobby update date
 * @param loaderData.users : Array containing connected users
 * @returns the JSX for the lobby information
 */
export default function PreGame({ loaderData }: Route.ComponentProps) {
  //console.log(loaderData);
  const { startGame } = UseWebSocket();
  const {
    id,
    code,
    active,
    leaderId,
    createdAt,
    updatedAt,
    users /*, chat */,
  } = loaderData;
  const navigate = useNavigate();
  //console.log(users);
  //console.log(chat);
  return (
    <>
      <li>
        <JoinLobby code={code} />
      </li>
      <li>
        <LeaveLobby />
      </li>
      <li>
        <button onClick={() => startGame()}>Start game</button>
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
