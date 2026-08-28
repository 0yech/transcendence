import { ErrorMessage } from '~/pages/auth/errorMessage';
import { LoginForm } from '~/pages/auth/login';
import type { Route } from './+types/login';
import { Link, redirect, useSearchParams } from 'react-router';
import { OauthLoginOptions } from '~/pages/auth/oauth';

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
    if (Array.isArray(body.message)) {
      // The validation pipe returns an array of potential error messages
      return { errorMessage: body.message.join(' ') };
    } else {
      return { errorMessage: body.message };
    }
  } else {
    throw redirect('/profile');
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  const [searchParams] = useSearchParams();

  let errorMessage = null;
  if (actionData) {
    // Normal auth errors, returned by clientActions
    errorMessage = actionData.errorMessage;
  } else {
    // OAuth errors, returned from the callback routes through the query string

    const errorType = searchParams.get('error');

    if (errorType !== null) {
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
  }

  return (
    <>
      <title>Transcendence</title>
      <button
        className="rounded-full w-fit px-5 bg-blue-500 hover:bg-blue-700"
        onClick={() => (window.location.href = '/')}
      >
        <h1 className="text-3xl font-bold">Login to Transcendence</h1>
      </button>
      <LoginForm />
      <Link
        className="underline decoration-indigo-500 hover:text-indigo-500"
        to="/register"
      >
        Don't have an account yet?
      </Link>

      <OauthLoginOptions />

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
    </>
  );
}
