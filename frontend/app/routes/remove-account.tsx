import { redirect } from 'react-router';
import apiFetch from '~/utils/api-fetch';

export async function clientAction() {
  if (!confirm('Delete your account? This cannot be undone.')) return undefined;

  const response = await apiFetch('/api/auth/remove-account', {
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
