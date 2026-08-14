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
