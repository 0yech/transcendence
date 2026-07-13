import { redirect } from 'react-router';

export async function clientAction() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });
  if (!response.ok) {
    alert(`Error logging out: ${response.status} ${response.statusText}`);
  }
  throw redirect('/login');
}
