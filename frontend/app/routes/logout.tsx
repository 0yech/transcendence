import { redirect } from 'react-router';

export async function clientAction() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });
  if (!response.ok) {
    const body = await response.json();
    alert(`Error logging out: ${body.message}`);
  }
  throw redirect('/login');
}
