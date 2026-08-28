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
