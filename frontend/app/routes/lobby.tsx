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
import {
  cardStyle,
  errorCardStyle,
  textTitleStyle,
  textTitle2Style,
  textMaskStyle,
  gradientAcceptStyle,
  textParaStyle,
} from '~/styles/style';
import { twMerge } from 'tailwind-merge';
import { StylisedLink } from '~/components/StylisedLink';

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

  const { code, private: isPrivate, createdAt, currentUserId } = loaderData;

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
  const date = new Date(createdAt ? createdAt : '');

  return (
    <>
      <NavBar className="fixed"></NavBar>
      <div className="pt-30 pb-10 min-h-dvh w-full flex flex-col justify-start items-center">
        <h1 className={twMerge(textTitleStyle, 'uppercase px-10 text-center')}>
          LOBBY OF{' '}
          <StylisedLink
            variant="gradient"
            className={twMerge('uppercase')}
            to={`/profile/byUser/${currentLeader?.username}`}
          >
            {currentLeader?.username}
          </StylisedLink>
        </h1>
        <div
          className={twMerge(
            'md:w-200 w-100 md:h-150 h-300 p-4 flex flex-col md:flex-row justify-between gap-4',
          )}
        >
          <div className="flex flex-col justify-between gap-2 w-full">
            <div
              className={twMerge(
                cardStyle,
                'flex flex-col justify-between h-115 w-full',
              )}
            >
              <div>
                <div className="flex justify-between">
                  <h2 className={textTitle2Style}>
                    Code:{' '}
                    <span
                      className={twMerge(textMaskStyle, gradientAcceptStyle)}
                    >
                      {code}
                    </span>
                  </h2>
                  {isPrivate && (
                    <h2 className={twMerge(errorCardStyle, 'h-fit w-fit')}>
                      This is a private lobby.
                    </h2>
                  )}
                </div>
              </div>
              <div>
                <h2 className={twMerge(textTitle2Style, 'font-bold mb-2')}>
                  Users
                </h2>
                <DisplayUsers
                  avatarClassName="md:w-40 md:h-40 w-25 h-25"
                  users={users}
                  leaderId={currentLeaderId}
                  currentUserId={currentUserId}
                  kickingUserId={kickingUserId}
                  onKick={handleKick}
                />
              </div>
              <h2 className={textParaStyle}>
                Created at:{' '}
                {date.toLocaleTimeString('en-US', { hour12: false })}
              </h2>
            </div>
            <div className="flex gap-4">
              {currentLeaderId === currentUserId && users.length > 1 && (
                <Button className="py-4" onClick={() => startGame()}>
                  Start game
                </Button>
              )}
              {isMember ? <LeaveLobby /> : <JoinLobby code={code} />}
            </div>
          </div>
          {!isPrivate || isMember ? (
            <LobbyChat className="w-90 h-full" code={code} canSend={isMember} />
          ) : (
            <p className={errorCardStyle}>This lobby chat is private.</p>
          )}
        </div>
      </div>
    </>
  );
}
