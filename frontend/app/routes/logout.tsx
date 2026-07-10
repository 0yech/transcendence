import { LogoutButton } from '../auth/logout';

export async function clientAction() {
  await fetch('/api/auth/logout', {
    method: 'POST',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status} ${response.statusText}`,
        );
      }
    })
    .catch((error) => {
      console.error('Error logging out: ', error);
    });
}

// TODO This will be removed once we have a real front-end, where we'll be able
// to put the logout button on the page
export default function Logout() {
  return (
    <>
      <title>Logout from Transcendence</title>
      <h1>Logout from Transcendence</h1>
      <LogoutButton />
      <a href="/login">Log back in?</a>
    </>
  );
}
