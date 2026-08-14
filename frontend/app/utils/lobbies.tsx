import { useState, useEffect } from "react";

export function CreateNewLobby()
{
  const url = "/api/lobbies"
  return (<h2><button onClick={() => {fetch(url, {
    method: "POST",
    body: JSON.stringify({
      "private": false,
    })
  })}}>CreateLobby</button></h2>);
}

export default function DisplayLobbies() {
  const [lobbies, setLobbies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLobbies = async () => {
    try {
      const response = await fetch("/api/lobbies");
      if (response.ok) {
        const data = await response.json();
        setLobbies(data);
      }
    } catch (error) {
      console.error("Error fetching lobbies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLobbies();
    const interval = setInterval(() => {
      fetchLobbies();
    }, 5000);

    // 3. Nettoyage de l'intervalle si le composant est démonté
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
          {lobbies.map((item: any) => (
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