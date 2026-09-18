import type { Route } from './+types/lobby';
import apiFetch, { UnauthenticatedError } from '~/utils/api-fetch';
import { redirect, type Params } from 'react-router';
import { DisplayUsers, JoinLobby, LeaveLobby } from '~/utils/lobbies';
import { useNavigate } from 'react-router';
import { UseWebSocket } from '~/context/UseWebSocket';
import { useState, useEffect } from 'react';
import type { UserInterfaceLobby } from '~/utils/lobbies';
import LobbyChat from '~/components/LobbyChat';
import { NavBar } from '~/components/Navbar';
import { getUserById } from '~/utils/users';

export async function clientLoader({ params }: { params: Params<string> }) {
  const { code } = params;

  try {
    const userResponse = await apiFetch('/api/auth/me', undefined, {
      redirectOnUnauthorized: false,
    });
    const user = await userResponse.json();

    const lobbyResponse = await apiFetch(`/api/lobbies/${code}`);
    const lobby = await lobbyResponse.json();

    return { ...lobby, currentUserId: user.id };
  } catch (error) {
    if (error instanceof UnauthenticatedError) throw redirect('/login');
    throw error;
  }
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
  const { startGame } = UseWebSocket();
  const [useUsers, setUsers] = useState<UserInterfaceLobby[] | null>(null);
  const [getLeaderId, setLeaderId] = useState<string>('');
  const [kickingUserId, setKickingUserId] = useState<string | null>(null);

  const {
    id,
    code,
    active,
    private: isPrivate,
    leaderId,
    createdAt,
    updatedAt,
    currentUserId,
  } = loaderData;

  getUserById(leaderId).then((data) => setLeaderId(data.username));

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUsers(code: string) {
      const data = await apiFetch(`/api/lobbies/${code}`);
      const json = await data.json();

      if (json && json.users) {
        setUsers(json.users);
      }
    }

    const interval = setInterval(() => {
      fetchUsers(code);
    }, 1000);

    return () => clearInterval(interval);
  }, [code]);

  const users: UserInterfaceLobby[] = useUsers ?? loaderData.users ?? [];

  const isMember =
    currentUserId !== null && users.some((user) => user.id === currentUserId);

  async function handleKick(memberId: string) {
    try {
      setKickingUserId(memberId);

      const response = await apiFetch(`/api/lobbies/members/${memberId}/kick`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);

        throw new Error(
          error?.message ?? `Failed to kick member (${response.status})`,
        );
      }

      const updatedLobby = await response.json();

      if (updatedLobby?.users) {
        setUsers(updatedLobby.users);
      }
    } catch (error) {
      console.error('Failed to kick member:', error);
    } finally {
      setKickingUserId(null);
    }
  }

  return (
    <>
      <NavBar></NavBar>
      <li>
        <JoinLobby code={code} />
      </li>

      <li>
        <LeaveLobby />
      </li>

      <li>
        <button
          className="rounded-full w-fit px-5 bg-pink-400 hover:bg-pink-600"
          onClick={() => startGame()}
        >
          Start game
        </button>
      </li>

      <li>
        <button
          className="rounded-full w-fit px-5 bg-blue-500 hover:bg-blue-700"
          onClick={() => navigate('/')}
        >
          Home
        </button>
      </li>

      <br />

      <div className="flex flex-row">
        <div>
          <h2>lobby id: {id}</h2>
          <h2>Code: {code}</h2>
          <h2>active: {active}</h2>
          <h2>is Private: {isPrivate ? 'true' : 'false'}</h2>
          <h2>leader: {getLeaderId}</h2>
          <h2>createdAt: {createdAt}</h2>
          <h2>updatedAt: {updatedAt}</h2>

          <h2>Users</h2>
          <DisplayUsers
            users={users}
            leaderId={leaderId}
            currentUserId={currentUserId}
            kickingUserId={kickingUserId}
            onKick={handleKick}
          />
        </div>

        <div>
          {!isPrivate || isMember ? (
            <LobbyChat code={code} canSend={isMember} />
          ) : (
            <p>This lobby chat is private.</p>
          )}
        </div>
      </div>
    </>
  );
}
