import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import apiFetch, { handleJoinLobby, handleLeaveLobby } from './api-fetch';
import { UseWebSocket } from '~/context/UseWebSocket';
import ProfilePicture from '~/components/ProfilePicture';
import { Avatar } from '~/components/Avatar';
import { Link } from 'react-router';
import { NavBar } from '~/components/Navbar';
import { twMerge } from 'tailwind-merge';
import { UserPopUp } from '~/components/userProfiles/userProfile';
import { Input } from '~/components/Input';
import { Form } from 'react-router';
import { Button } from '~/components/Button';

export interface UserInterfaceLobby {
  id: string;
  username: string;
  avatarUrl: string | null;
  guildRole: string | null;
  guild: {
    name: string;
  } | null;
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
  users: UserInterfaceLobby[];
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
              <p>{user.username}</p>
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
 *
 * @brief create a lobby using the api POST /api/lobbies
 *
 */
export function CreateNewLobbies() {
  const { connect } = UseWebSocket();
  const navigate = useNavigate();
  async function handleClick(isLobbPrivate: boolean) {
    const rep = await apiFetch('/api/lobbies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        private: isLobbPrivate,
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
    <>
      <div className="flex flex-col gap-5 w-80">
        <Button
          className="w-full h-15"
          variant="accept"
          onClick={() => {
            handleClick(false);
          }}
        >
          Create Lobby
        </Button>
        <Button
          className="w-full h-15"
          variant="danger"
          onClick={() => {
            handleClick(true);
          }}
        >
          Create Private Lobby
        </Button>
      </div>
    </>
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
  const navigate = useNavigate();

  async function handleClickLeave() {
    try {
      await handleLeaveLobby();
      disconnect();
      navigate('/lobbies');
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

export function JoinLobbyWithCodeForm() {
  const [code, setCode] = useState<string>('');
  const navigate = useNavigate();

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      const resp = await fetch(`/api/lobbies/${code}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (resp.ok) navigate(`/game/${code}`);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Form
      className="flex flex-col gap-5 w-80"
      method="post"
      onSubmit={handleSubmit}
    >
      <Input
        className="w-full h-15"
        type="text"
        name="code"
        id="code"
        placeholder="Code"
        autoComplete="code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />
      <Button className="w-full h-15" variant="accept" disabled={!code}>
        Join lobby by code
      </Button>
    </Form>
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
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const HOVER_DELAY = 150;
  const handleUsernameEnter = (userId: string) => {
    hoverTimeout.current = setTimeout(() => {
      setHoveredUserId(userId);
    }, HOVER_DELAY);
  };

  const handleUsernameLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredUserId(null);
  };

  useEffect(() => {
    console.log(hoveredUserId);
  }, [hoveredUserId]);

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
    return (
      <>
        <NavBar />
        <h1>Loading lobbies...</h1>
      </>
    );
  }

  console.log(lobbies);
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
      <div className="flex justify-around items-center mt-5">
        <JoinLobbyWithCodeForm />
        <CreateNewLobbies />
      </div>
      {lobbies.length === 0 ? (
        <h1>No active lobbies</h1>
      ) : (
        <ul className="ml-4 flex flex-col gap-5 mt-5 items-center">
          {lobbies.map((item: LobbyInterface, index) => (
            <li
              key={item.code}
              className={`animate-fadeIn`}
              style={{ '--delay': `${index * 150}ms` } as React.CSSProperties}
            >
              <Link
                to={`/game/${item.code}`}
                className={`flex items-center gap-1 p-1.5 justify-between bg-linear-to-r from-blue to-pink hover:bg-linear-to-r hover:from-pink hover:to-orange h-23 w-100 rounded-[17px] group`}
              >
                <div className="flex flex-col ml-1">
                  <ul className="flex h-1/2 -space-x-5 overflow-hidden p-1">
                    {item.users.map((user) => (
                      <li
                        key={user.id}
                        className=""
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log(user.username);
                        }}
                        onMouseEnter={() => handleUsernameEnter(user.id)}
                        onMouseLeave={handleUsernameLeave}
                      >
                        <div
                          className={twMerge(
                            hoveredUserId === user.id
                              ? 'opacity-100'
                              : 'opacity-0',
                            'bg-white/10 text-shadow-lg transittion-all duration-400 ease-out rounded-2xl backdrop-blur-xs shadow-lg absolute ml-0.5 mt-10 h-18 z-20',
                          )}
                        >
                          <UserPopUp user={user} />
                        </div>
                        <Avatar
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
