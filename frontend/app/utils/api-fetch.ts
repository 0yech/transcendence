import { redirect } from 'react-router';

/**
 * @brief This function will fetch the resources at `input`, and if a 401 is
 * received back, will attempt to refresh the current session's token with the
 * backend. If this does not work, it will throw a redirect to `/login`.
 *
 * @note It doesn't accept a `Request` instance, because we try to fetch it twice.
 * The first fetch would consume it, and the second would fail regardless. Use
 * a string and the options instead.
 */
export default async function apiFetch(
  input: string | URL,
  options?: RequestInit,
) {
  const firstTry = await fetch(input, options);

  // Return anything other than unauthorized as is
  if (firstTry.status !== 401) return firstTry;

  // Try to refresh the token
  const refreshResponse = await fetch('/api/auth/refresh', {
    method: 'POST',
  });
  if (!refreshResponse.ok) throw redirect('/login');

  const secondTry = await fetch(input, options);

  // Return anything other than unauthorized as is
  if (secondTry.status === 401) throw redirect('/login');

  return secondTry;
}
