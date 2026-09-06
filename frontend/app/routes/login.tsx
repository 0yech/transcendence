import { ErrorMessage } from '~/pages/auth/errorMessage';
import { LoginForm } from '~/pages/auth/login';
import type { Route } from './+types/login';
import { redirect, useNavigate, useSearchParams } from 'react-router';
import { OauthLoginOptions } from '~/pages/auth/oauth';
import { StylisedLink } from '../components/StylisedLink';
import { NavBar } from '~/components/Navbar';
import { UseWebSocket } from '~/context/UseWebSocket';
import { useEffect } from 'react';

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
      return { errorMessage: body.message.join(' ') };
    } else {
      return { errorMessage: body.message };
    }
  }

  const resp = await fetch('/api/auth/me');
  if (resp.ok) {
    const userJson = await resp.json();
    const lobbyResponse = await fetch('/api/lobbies/me');
    if (lobbyResponse.ok) {
      console.log(lobbyResponse);
      const lobbyText = await lobbyResponse.text();
      if (!lobbyText) return { user: userJson, lobbies: null };

      const lobbyJson = await lobbyResponse.json();
      return { user: userJson, lobbies: lobbyJson };
    }
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  const { setUser, setCode } = UseWebSocket();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (actionData?.user) {
      setUser(actionData.user);
      if (actionData.lobbies) setCode(actionData.lobbies.code);
      navigate('/');
    }
  }, [actionData?.user, setUser, actionData?.lobbies, setCode, navigate]);

  let errorMessage = null;
  if (actionData?.errorMessage) {
    errorMessage = actionData.errorMessage;
  } else {
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
      <NavBar className="fixed"></NavBar>
      <div className="w-full h-dvh flex justify-center items-center">
        <div className="w-fit p-5 rounded-4xl bg-dark-blue/20 shadow-xl shadow-dark-blue/30 h-fit flex flex-col items-center gap-2">
          <h1 className="text-2xl">Login to Transcendence</h1>
          <LoginForm />
          {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
          <h1 className="text-1xl text-center">
            Don't have an account yet?{' '}
            <StylisedLink to="/register">Sign up</StylisedLink>
          </h1>
          <hr className="w-70 my-2 border-0 h-1 rounded-full bg-mid-dark-blue" />
          <OauthLoginOptions />
        </div>
      </div>
    </>
  );
}
