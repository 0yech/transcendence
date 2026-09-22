import type { Route } from './+types/lobby';
import apiFetch, { UnauthenticatedError } from '~/utils/api-fetch';
import { redirect, type Params } from 'react-router';
import { DisplayUsers, JoinLobby, LeaveLobby } from '~/utils/lobbies';
import { UseWebSocket } from '~/context/UseWebSocket';
import { useState, useEffect } from 'react';
import type { UserInterfaceLobby } from '~/utils/lobbies';
import LobbyChat from '~/components/LobbyChat';
import { NavBar } from '~/components/Navbar';
import { Button } from '~/components/Button';
import { cardStyle } from '~/styles/style';
import { twMerge } from 'tailwind-merge';

export async function clientLoader({ params }: { params: Params<string> }) {
  const { code } = params;

  try {
    const userResponse = await apiFetch('/api/auth/me', undefined, {
      redirectOnUnauthorized: false,
    });
    const user = await userResponse.json();

    const lobbyResponse = await apiFetch(`/api/lobbies/${code}`);
    if (lobbyResponse.status === 404) throw redirect('/');

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
  const { startGame, connect } = UseWebSocket();
  const [useUsers, setUsers] = useState<UserInterfaceLobby[] | null>(null);
  const [currentLeaderId, setCurrentLeaderId] = useState<string>(
    loaderData.leaderId,
  );
  const [kickingUserId, setKickingUserId] = useState<string | null>(null);

  const {
    code,
    private: isPrivate,
    // createdAt,
    currentUserId,
  } = loaderData;

  useEffect(() => {
    async function fetchUsers(code: string) {
      const data = await apiFetch(`/api/lobbies/${code}`);
      const json = await data.json();

      if (json && json.users) {
        setUsers(json.users);
      }

      if (typeof json?.leaderId === 'string' && json.leaderId.length > 0) {
        setCurrentLeaderId(json.leaderId);
      }
    }

    const interval = setInterval(() => {
      fetchUsers(code);
    }, 1000);

    return () => clearInterval(interval);
  }, [code]);

  const users: UserInterfaceLobby[] = useUsers ?? loaderData.users ?? [];
  const currentLeader = users.find((user) => user.id === currentLeaderId);

  const isMember =
    currentUserId !== null && users.some((user) => user.id === currentUserId);

  useEffect(() => {
    if (!isMember) return;

    connect(code).catch((error) => {
      console.error('Failed to restore game websocket:', error);
    });
  }, [code, isMember, connect]);

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
      <div className="fixed top-0 left-0 h-dvh w-full flex justify-center items-center">
        <div
          className={twMerge(cardStyle, 'w-200 h-150 p-4 flex justify-between')}
        >
          <div className="flex flex-col justify-between items-between h-full w-full">
            <div>
              <h1 className="text-2xl font-bold uppercase">
                LOBBY OF {currentLeader?.username}
              </h1>
              <h2>Lobby code: {code}</h2>
              {isPrivate && <h2>This is a private lobby.</h2>}
            </div>
            <div>
              <h2>Users</h2>
              <DisplayUsers
                users={users}
                leaderId={currentLeaderId}
                currentUserId={currentUserId}
                kickingUserId={kickingUserId}
                onKick={handleKick}
              />
            </div>
            <div className="flex gap-4">
              {currentLeaderId === currentUserId && users.length > 1 && (
                <Button onClick={() => startGame()}>Start game</Button>
              )}
              {isMember ? <LeaveLobby /> : <JoinLobby code={code} />}
            </div>
          </div>
          {!isPrivate || isMember ? (
            <LobbyChat
              className="w-100 h-full"
              code={code}
              canSend={isMember}
            />
          ) : (
            <p>This lobby chat is private.</p>
          )}
        </div>
      </div>
    </>
  );
}
