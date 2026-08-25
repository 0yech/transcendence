import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import apiFetch, { handleJoinLobby, handleLeaveLobby } from './api-fetch';
import { UseWebSocket } from '~/context/UseWebSocket';

interface UserInterface {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  guildId: string | null;
  guildRole: string | null;
  createdAt: string;
  updatedAt: string;
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
  users: UserInterface[];
  chat: ChatInterface;
}

export function DisplayUsers(usersObject: { users: UserInterface[] }) {
  const { users } = usersObject;
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>
          <div>
            <p>
              {user.username} | {user.email}
            </p>
            {user.avatarUrl && <img src={user.avatarUrl} alt={user.username} />}
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 *
 * @brief create a lobby using the api POST /api/lobbies
 *
 */
export function CreateNewLobby() {
  const { connect } = UseWebSocket();

  async function handleClick() {
    const rep = await apiFetch('/api/lobbies', {
      method: 'POST',
      body: JSON.stringify({
        private: false,
      }),
    });
    if (!rep.ok)
        return ;
    apiFetch('/api/lobbies/me').then(((data) => data.json())).then((json) => connect(json.code));
  }
  return (
    <h2>
      <button onClick={() => handleClick()}>
        CreateLobby
      </button>
    </h2>
  );
}

export function JoinLobby({ code }: { code: string }) {
  const { connect } = UseWebSocket();
  async function handleClickJoin(code:string) {
    try {
      await handleJoinLobby(code);
      connect(code);
    } catch (e) {
      console.log(e);
    }
  }
  return <button onClick={() => handleClickJoin(code)}>Join this Lobby</button>;
}

export function LeaveLobby() {
  const { disconnect } = UseWebSocket();
  async function handleClickLeave() {
    try {
      await handleLeaveLobby();
      disconnect();
    } catch (e) {
      console.log(e);
    }
  }
  return <button onClick={() => handleClickLeave()}>Leave This Lobby</button>;
}

/**
 *
 * @brief display the list of lobby every 5 seconds. can join by clicking on the lobby list
 * @brief each lobbies displayed are joinable by clicking on them.
 *
 */
export default function DisplayLobbies() {
  const navigate = useNavigate();
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
      <h1>Lobbies: {lobbies.length}</h1>
      {lobbies.length === 0 ? (
        <h1>No active lobbies</h1>
      ) : (
        <ul>
          {lobbies.map((item: LobbyInterface) => (
            <li key={item.code}>
              <button onClick={() => navigate(`/game/${item.code}`)}>
                Join Lobby: {item.code}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
