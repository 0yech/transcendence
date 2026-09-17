import apiFetch from './api-fetch';
import type { SelfUserInterface } from '~/context/WebSocketContext';

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

/**
 * @brief Get the logged-in user, or null when nobody is logged in.
 *
 * Goes through apiFetch, so an expired access token is refreshed first. When
 * the session can't be refreshed, apiFetch throws a redirect to /login; that
 * is caught here, because callers only need to know who is logged in.
 *
 * @return The logged-in user, or null.
 */
export async function getCurrentUser(): Promise<SelfUserInterface | null> {
  try {
    const response = await apiFetch('/api/auth/me');

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
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
