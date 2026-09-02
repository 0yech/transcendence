import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import apiFetch, { handleJoinLobby, handleLeaveLobby } from './api-fetch';
import { UseWebSocket } from '~/context/UseWebSocket';
import ProfilePicture from '~/components/ProfilePicture';
import { Avatar } from '~/components/userProfiles/Avatar';
import { Link } from 'react-router';
import { NavBar } from '~/components/Navbar';

export interface UserInterfaceLobby {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  guildId: string | null;
  guildRole: string | null;
  createdAt: string;
  updatedAt: string;
  totalPts: number | null;
}

interface ChatInterface {
  id: string;
  lobbyId: string;
  createdAt: string;
  updatedAt: string;
}

interface LobbyInterface {
  id: string;
  code: string;
  active: boolean;
  private: boolean;
  createdAt: string;
  updatedAt: string;
  leaderId: string;
  users: UserInterface[];
  chat: ChatInterface;
}

/**
 * @brief Component that allows users to be displayed
 *
 * @returns the jsx for the list of users in a <li>
 */
export function DisplayUsers(usersObject: {
  users: UserInterfaceLobby[] | null;
}) {
  const { users } = usersObject;
  return (
    <ul>
      {users ? (
        users.map((user) => (
          <li key={user.id}>
            <div>
              <p>
                {user.username} | {user.email}
              </p>
              {user.avatarUrl && (
                <ProfilePicture
                  avatarUrl={user.avatarUrl}
                  username={user.username}
                />
              )}
            </div>
          </li>
        ))
      ) : (
        <></>
      )}
    </ul>
  );
}

/**
 * @brief Component that handle the conditions as stated below
 * @brief handle the "go to game" if a lobby is active
 * @brief handle the "go to lobby" if a lobby is active
 * @brief handle the "create lobby" if no lobby is active
 *
 * @returns the JSX necessary of stated up
 */
export function GoToActiveLobby() {
  const { isConnected, gameStarted } = UseWebSocket();
  const isConnectedToWs = isConnected();
  const activeLobby = gameStarted();
  const navigate = useNavigate();
  return (
    <>
      {isConnectedToWs ? (
        <li>
          {activeLobby ? (
            <button
              className="rounded-full w-fit px-5 bg-blue-500 hover:bg-blue-700"
              onClick={() => navigate(`/game/${isConnectedToWs}/play`)}
            >
              Go to active game
            </button>
          ) : (
            <button
              className="rounded-full w-fit px-5 bg-blue-500 hover:bg-blue-700"
              onClick={() => navigate(`/game/${isConnectedToWs}`)}
            >
              Go to active lobby
            </button>
          )}
        </li>
      ) : (
        <li>
          <CreateNewLobby />
        </li>
      )}
    </>
  );
}

/**
 *
 * @brief create a lobby using the api POST /api/lobbies
 *
 */
export function CreateNewLobby() {
  const { connect } = UseWebSocket();
  const navigate = useNavigate();
  async function handleClick() {
    const rep = await apiFetch('/api/lobbies', {
      method: 'POST',
      body: JSON.stringify({
        private: false,
      }),
    });
    if (!rep.ok) return;
    apiFetch('/api/lobbies/me')
      .then((data) => data.json())
      .then((json) => {
        connect(json.code)
          .then(() => navigate(`/game/${json.code}`))
          .catch((e) => console.error(e));
      });
  }
  return (
    <h2>
      <button
        className="rounded-full w-fit px-5 bg-blue-500 hover:bg-blue-700"
        onClick={() => handleClick()}
      >
        Create lobby
      </button>
    </h2>
  );
}

/**
 *
 * @brief handle the connection of the user. join the lobby with the request AND the webSocket
 *
 */
export function JoinLobby({ code }: { code: string }) {
  const { connect } = UseWebSocket();
  async function handleClickJoin(code: string) {
    try {
      const repApi = await handleJoinLobby(code);
      console.log(repApi);
      const gameConnect = await connect(code);
      console.log(gameConnect);
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <button
      className="rounded-full w-fit px-5 bg-green-500 hover:bg-green-700"
      onClick={() => handleClickJoin(code)}
    >
      Join this Lobby
    </button>
  );
}

/**
 *
 * @brief handle the disconnection of the user. leave the lobby with the request AND the webSocket
 *
 */
export function LeaveLobby() {
  const { disconnect } = UseWebSocket();
  async function handleClickLeave() {
    try {
      await handleLeaveLobby();
      disconnect();
    } catch (e) {
      console.error(e);
    }
  }
  return (
    <button
      className="rounded-full w-fit px-5 bg-red-500 hover:bg-red-700"
      onClick={() => handleClickLeave()}
    >
      Leave This Lobby
    </button>
  );
}

/**
 *
 * @brief display the list of lobby every 5 seconds. can join by clicking on the lobby list
 * @brief each lobbies displayed are joinable by clicking on them.
 *
 */

export default function DisplayLobbies() {
  const [lobbies, setLobbies] = useState<LobbyInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLobbies = async () => {
    try {
      const response = await fetch('/api/lobbies');
      if (response.ok) {
        const data = await response.json();
        setLobbies(data);
      }
    } catch (error) {
      console.error('Error fetching lobbies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLobbies();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading && lobbies.length === 0) {
    return <h1>Chargement des salons...</h1>;
  }

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-in both;
          animation-delay: var(--delay, 0ms);
        }
      `}</style>
      <NavBar></NavBar>
      <h1>Lobbies: {lobbies.length}</h1>
      {lobbies.length === 0 ? (
        <h1>No active lobbies</h1>
      ) : (
        <ul className="ml-4">
          {lobbies.map((item: LobbyInterface, index) => (
            <li
              key={item.code}
              className={`animate-fadeIn`}
              style={{ '--delay': `${index * 150}ms` } as React.CSSProperties}
            >
              <Link
                to={`/game/${item.code}`}
                className={`flex flex-row items-center gap-1 p-1.5 mt-5 justify-between bg-linear-to-r from-blue to-pink hover:bg-linear-to-r hover:from-pink hover:to-orange h-23 w-100 rounded-[17px] group`}
              >
                <div className="flex flex-col ml-1">
                  <ul className="flex h-1/2 -space-x-5 overflow-hidden p-1">
                    {item.users.map((user) => (
                      <li className="relative">
                        <Avatar
                          key={user.id}
                          src={user.avatarUrl}
                          className="w-10 h-10 rounded-full ring-2 ring-black shadow-md hover:scale-110 transition-all duration-300"
                        />
                      </li>
                    ))}
                  </ul>
                  <h1 className="flex ml-1 h-full items-center">{item.code}</h1>
                </div>
                <ul className="grid grid-rows-3 grid-cols-2 m-1">
                  {item.users.map((user) => {
                    return (
                      <li
                        key={user.username}
                        className={`ml-1 mr-1 text-sm ${user.id === item.leaderId ? 'font-extrabold text-black' : 'text-light-yellow'}`}
                      >
                        {user.username}
                      </li>
                    );
                  })}
                </ul>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
