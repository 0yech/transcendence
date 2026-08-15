import { useState, useEffect } from 'react';

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

/** 
  *
  * @brief create a lobby using the api POST /api/lobbies
  *
  */
export function CreateNewLobby() {
  const url: string = '/api/lobbies';
  return (
    <h2>
      <button
        onClick={() => {
          fetch(url, {
            method: 'POST',
            body: JSON.stringify({
              private: false,
            }),
          });
        }}
      >
        CreateLobby
      </button>
    </h2>
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

  console.log(lobbies);
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLobbies();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /** 
    *
    * @brief Send a POST request to /api/lobbies/xxx/join to join the game when clicking on it
    * 
    * @param code used to join the lobby
    */
  const handleJoinLobby = async (code: string) => {
    try {
      const response = await fetch(`/api/lobbies/${code}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.error('Failed to join lobby');
      }
    } catch (error) {
      console.error('Error joining lobby:', error);
    }
  };

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
              <button onClick={() => handleJoinLobby(item.code)}>
                Join Lobby: {item.code}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
