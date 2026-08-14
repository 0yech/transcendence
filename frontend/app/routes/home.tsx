import { Welcome } from '../welcome/welcome';
import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';

export function HomeButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => {
        navigate('/');
      }}
    >
      Home
    </button>
  );
}

async function getFetch(route: string) {
  const resp = await fetch(route);
  if (!resp.ok) return null;
  const json = await resp.json();
  return json;
}

export default function Home() {
  const [user, setUser] = useState({
    username: 'Login',
    avatarUrl: 'Chargement...',
  });
  useEffect(() => {
    // Déclaration d'une fonction asynchrone interne pour le useEffect
    async function fetchUser() {
      const data = await getFetch('/api/auth/me');
      if (data && data.username) {
        setUser({
          username: data.username || 'Login',
          avatarUrl: data.avatarUrl || '',
        });
      }
    }

    fetchUser();
  }, []);
  return (
    <>
      <title>Transcendence</title>
      <Welcome data={user} />
    </>
  );
}
