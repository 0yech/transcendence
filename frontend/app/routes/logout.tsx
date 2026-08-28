import { redirect } from 'react-router';

export async function clientAction() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
  });
  if (!response.ok) {
    const body = await response.json();
    if (Array.isArray(body.message)) {
      // The validation pipe returns an array of potential error messages
      return { errorMessage: body.message.join(' ') };
    } else {
      return { errorMessage: body.message };
    }
  }
  throw redirect('/login');
}
