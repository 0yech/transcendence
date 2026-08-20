import { redirect } from 'react-router';
import apiFetch from '~/utils/api-fetch';

export async function clientAction() {
  if (!confirm('Delete your account? This cannot be undone.')) return null;

  const response = await apiFetch('/api/auth/remove-account', {
    method: 'POST',
  });
  if (!response.ok) {
    const body = await response.json();
    alert(`Error deleting account: ${body.message}`);
    return null;
  }
  throw redirect('/login');
}
