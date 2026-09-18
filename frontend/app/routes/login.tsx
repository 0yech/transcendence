import { LoginForm } from '~/pages/auth/login';
import type { Route } from './+types/login';
import { useNavigate } from 'react-router';
import { OauthLoginOptions } from '~/pages/auth/oauth';
import { StylisedLink } from '../components/StylisedLink';
import { NavBar } from '~/components/Navbar';
import { UseWebSocket } from '~/context/UseWebSocket';
import { useEffect } from 'react';
import { ErrorMessage } from '~/pages/auth/errorMessage';

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
      const lobbyText = await lobbyResponse.text();
      if (!lobbyText) return { user: userJson, lobbies: null };

      const lobbyJson = JSON.parse(lobbyText);
      return { user: userJson, lobbies: lobbyJson };
    }
  }
}

export default function Login({ actionData }: Route.ComponentProps) {
  const { setUser, setCode } = UseWebSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (actionData?.user) {
      setUser(actionData.user);
      if (actionData.lobbies) setCode(actionData.lobbies.code);
      navigate('/');
    }
  }, [actionData?.user, setUser, actionData?.lobbies, setCode, navigate]);

  return (
    <>
      <title>Transcendence</title>
      <NavBar className="fixed"></NavBar>
      <div className="w-full h-dvh flex justify-center items-center">
        <div className="w-fit p-5 rounded-4xl bg-dark-blue/20 shadow-xl shadow-dark-blue/30 h-fit flex flex-col items-center gap-2">
          <h1 className="text-2xl">Login to Transcendence</h1>
          <LoginForm />
          <ErrorMessage message={actionData?.errorMessage} />
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
