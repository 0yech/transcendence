import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import apiFetch, { handleJoinLobby, handleLeaveLobby } from './api-fetch';
import { UseWebSocket } from '~/context/UseWebSocket';
import { Avatar } from '~/components/Avatar';
import { Link } from 'react-router';
import { NavBar } from '~/components/Navbar';
import { twMerge } from 'tailwind-merge';
import { UserPopUp } from '~/components/userProfiles/userProfile';
import { Input } from '~/components/Input';
import { Form } from 'react-router';
import { Button } from '~/components/Button';
import {
  accentPillClass,
  eyebrowClass,
  pageShellClass,
  primaryCardClass,
  widePageGridClass,
  buttonCreate,
  buttonCreatePrivate,
} from '~/styles/theme';

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
              <Avatar src={user.avatarUrl} alt={user.username} />
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
    <div className="flex flex-col gap-3">
      <Button
        className={`h-13 ${buttonCreate}`}
        onClick={() => {
          handleClick(false);
        }}
      >
        Create Lobby
      </Button>
      <Button
        className={`h-13 ${buttonCreatePrivate}`}
        onClick={() => {
          handleClick(true);
        }}
      >
        Create Private Lobby
      </Button>
    </div>
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
    <Form className="flex flex-col gap-3" method="post" onSubmit={handleSubmit}>
      <Input
        className="h-13 w-full text-xl"
        type="text"
        name="code"
        id="code"
        placeholder="Code"
        autoComplete="code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
      />
      <Button
        className="h-13 w-full bg-linear-to-r from-blue to-pink text-lg hover:from-pink hover:to-mid-dark-pink hover:shadow-lg hover:shadow-pink"
        disabled={!code}
      >
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
  const navigate = useNavigate();

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

  return (
    <>
      <NavBar></NavBar>
      <main className={pageShellClass}>
        <div className={widePageGridClass}>
          <aside className="self-start lg:sticky lg:top-22">
            <div className={primaryCardClass}>
              <p className={eyebrowClass}>Game room</p>
              <h1 className="mt-1 text-4xl font-black">Lobbies</h1>
              <p className="mt-3 opacity-70">
                Enter a code or start a room for your next match.
              </p>

              <div className="mt-7 border-t border-light-pink/15 pt-6">
                <h2 className="text-xl font-black">Join with a code</h2>
                <div className="mt-3">
                  <JoinLobbyWithCodeForm />
                </div>
              </div>

              <div className="mt-7 border-t border-light-pink/15 pt-6">
                <h2 className="text-xl font-black">Start a lobby</h2>
                <div className="mt-3">
                  <CreateNewLobbies />
                </div>
              </div>
            </div>
          </aside>

          <section className={`${primaryCardClass} lg:col-span-2`}>
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <p className={eyebrowClass}>Available now</p>
                <h2 className="mt-1 text-3xl font-black sm:text-4xl">
                  Open lobbies
                </h2>
              </div>
              <span className={accentPillClass}>{lobbies.length}</span>
            </div>

            {loading ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 24 }}
                className="mt-5 flex flex-col gap-4"
              >
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    animate={{ opacity: [0.35, 0.7, 0.35] }}
                    transition={{
                      duration: 1.4,
                      delay: index * 0.12,
                      repeat: Infinity,
                    }}
                    className="h-32 rounded-3xl bg-dark-blue/40 shadow-lg shadow-dark-blue/30"
                  />
                ))}
              </motion.div>
            ) : lobbies.length === 0 ? (
              <p className="py-12 text-center text-xl opacity-60">
                No active lobbies.
              </p>
            ) : (
              <motion.ul layout className="mt-5 flex flex-col gap-4">
                <AnimatePresence>
                  {lobbies.map((item, index) => (
                    <motion.li
                      layout
                      key={item.code}
                      initial={{ opacity: 0, y: 28, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.98 }}
                      transition={{
                        delay: Math.min(index * 0.06, 0.3),
                        type: 'spring',
                        stiffness: 260,
                        damping: 24,
                      }}
                    >
                      <Link
                        to={`/game/${item.code}`}
                        className="group flex min-h-28 items-center justify-between gap-5 rounded-3xl bg-dark-blue/40 p-5 shadow-lg shadow-dark-blue/30 transition-colors duration-300 hover:bg-pink/15"
                      >
                        <div className="min-w-0">
                          <ul className="flex -space-x-4 overflow-visible p-1">
                            {item.users.map((user) => (
                              <li
                                key={user.id}
                                className="relative"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  navigate(`/profile/byUser/${user.username}`);
                                }}
                                onMouseEnter={() =>
                                  handleUsernameEnter(user.id)
                                }
                                onMouseLeave={handleUsernameLeave}
                              >
                                <div
                                  className={twMerge(
                                    hoveredUserId === user.id
                                      ? 'pointer-events-auto opacity-100'
                                      : 'pointer-events-none opacity-0',
                                    'absolute left-0 top-11 z-20 w-56 rounded-2xl bg-dark-blue/90 text-shadow-lg shadow-xl shadow-dark-blue/50 backdrop-blur-xs transition-all duration-300',
                                  )}
                                >
                                  <UserPopUp user={user} />
                                </div>
                                <Avatar
                                  src={user.avatarUrl}
                                  className="h-11 w-11 rounded-full ring-2 ring-dark-blue shadow-md transition-transform duration-300 hover:scale-110"
                                />
                              </li>
                            ))}
                          </ul>
                          <h3 className="mt-3 truncate text-2xl font-black tracking-wide group-hover:text-pink">
                            {item.code}
                          </h3>
                        </div>
                        <ul className="grid max-w-1/2 grid-cols-1 gap-x-5 gap-y-1 text-right sm:grid-cols-2">
                          {item.users.map((user) => (
                            <li
                              key={user.id}
                              className={
                                user.id === item.leaderId
                                  ? 'font-extrabold text-pink'
                                  : 'text-light-gray'
                              }
                            >
                              {user.username}
                            </li>
                          ))}
                        </ul>
                      </Link>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </motion.ul>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
