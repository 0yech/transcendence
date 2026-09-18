import Lobbies from '~/utils/lobbies';
import apiFetch from '~/utils/api-fetch';
import type { SelfUserInterface } from '~/context/WebSocketContext';

export async function clientLoader() {
  const response = await apiFetch('/api/auth/me');
  return (await response.json()) as SelfUserInterface;
}

export default function LobbiesPage() {
  return <Lobbies />;
}
