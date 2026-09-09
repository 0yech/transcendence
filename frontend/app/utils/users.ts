import apiFetch from './api-fetch';

export type UserIdentity = {
  id: string;
  username: string;
};

export async function getUserById(id: string): Promise<UserIdentity> {
  const response = await apiFetch(`/api/users/${encodeURIComponent(id)}`);

  if (!response.ok) {
    throw new Error('User not found');
  }

  return response.json();
}

export async function getUserByUsername(
  username: string,
): Promise<UserIdentity> {
  const response = await apiFetch(
    `/api/users/username/${encodeURIComponent(username)}`,
  );

  if (!response.ok) {
    throw new Error('User not found');
  }

  return response.json();
}

export type PlayerStats = {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  gamesWithPoints: number;
  scoredGameRate: number;
  lastPlayedAt: string | null;
};

/**
 * @brief Get lifetime statistics for a player profile.
 */
export async function getPlayerStats(id: string): Promise<PlayerStats> {
  const response = await apiFetch(
    `/api/users/public/id/${encodeURIComponent(id)}/stats`,
  );

  if (!response.ok) {
    throw new Error('Player stats not found');
  }

  return response.json();
}
