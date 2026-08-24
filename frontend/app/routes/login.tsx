import { ErrorMessage } from '~/auth/errorMessage';
import { LoginForm } from '../auth/login';
import type { Route } from './+types/login';
import { Link, redirect, useSearchParams } from 'react-router';
import { OauthLoginOptions } from '~/auth/oauth';

export async function clientAction({ request }: Route.ClientActionArgs) {
  const data = await request.formData();
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(data)),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });

  if (!response.ok) {
    const body = await response.json();
    alert(`Error logging in: ${body.message}`);
  } else {
    throw redirect('/profile');
  }
}

export default function Login() {
  const [searchParams] = useSearchParams();

  const errorType = searchParams.get('error');

  let errorMessage = null;
  if (errorType !== null) {
    // Check for OAuth errors
    switch (errorType) {
      case 'BASIC_AUTH':
        errorMessage =
          'Account was created with username and password. Please login using your username and password.';
        break;
      case 'DIFFERENT_PROVIDER':
        errorMessage =
          'Account was created with a different OAuth provider. Please login using your usual provider.';
        break;
      case 'MISSING_DATA':
        errorMessage =
          "The OAuth provider didn't send important data. Make sure your account is complete. For example, on Google, make sure your email has been verified.";
        break;
      default:
        errorMessage = 'Unknown error. Try again? Or check the backend logs.';
    }
  }

  // TODO create an error component displaying errors, including the ones that aren't OAuth related
  return (
    <>
      <title>Transcendence</title>
      <button onClick={() => (window.location.href = '/')}>
        <h1 className="text-3xl font-bold">Login to Transcendence</h1>
      </button>
      <LoginForm />
      <Link to="/register">Don't have an account yet?</Link>

      <OauthLoginOptions />

      <ErrorMessage message={errorMessage} />
    </>
  );
}
