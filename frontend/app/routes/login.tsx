import { LoginForm } from '~/pages/auth/login';
import type { Route } from './+types/login';
import { useNavigate, useSearchParams } from 'react-router';
import { OauthLoginOptions } from '~/pages/auth/oauth';
import { StylisedLink } from '../components/StylisedLink';
import { NavBar } from '~/components/Navbar';
import { UseWebSocket } from '~/context/UseWebSocket';
import { useEffect } from 'react';
import { ErrorMessage } from '~/pages/auth/errorMessage';
import { cardStyle, Separator } from '~/styles/style';
import { twMerge } from 'tailwind-merge';

/**
 * Turns the error type the back-end's OAuth callback filter redirects us to
 * `/login?error=` with into something readable. The cases match the
 * `OAuthError` enum on the back-end.
 */
function oauthErrorMessage(errorType: string) {
  switch (errorType) {
    case 'BASIC_AUTH':
      return 'Account was created with username and password. Please login using your username and password.';
    case 'DIFFERENT_PROVIDER':
      return 'Account was created with a different OAuth provider. Please login using your usual provider.';
    case 'MISSING_DATA':
      return "The OAuth provider didn't send us important data. Make sure your account is complete. For example, on Google, make sure your email has been verified, and on GitHub, select a public email address.";
    default:
      return 'Unknown error. Try again? Or check the backend logs.';
  }
}

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
  const { setUser, connect } = UseWebSocket();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!actionData?.user) return;

    const user = actionData.user;
    const lobbies = actionData.lobbies;

    async function restoreSession() {
      setUser(user);

      if (lobbies?.code) {
        try {
          await connect(lobbies.code);
        } catch (error) {
          console.error('Failed to restore websocket after login:', error);
        }
      }

      navigate('/');
    }

    void restoreSession();
  }, [actionData?.user, actionData?.lobbies, connect, navigate, setUser]);

  // An error from the login form takes priority over a stale `?error=` that
  // an earlier OAuth attempt left in the address bar.
  const oauthErrorType = searchParams.get('error');
  const errorMessage: string | undefined =
    actionData?.errorMessage ??
    (oauthErrorType === null ? undefined : oauthErrorMessage(oauthErrorType));

  return (
    <>
      <title>Transcendence</title>
      <NavBar className="fixed"></NavBar>
      <div className="w-full h-dvh flex justify-center items-center">
        <div
          className={twMerge(
            'w-fit h-fit flex flex-col items-center gap-2',
            cardStyle,
          )}
        >
          <h1 className="text-2xl">Login to Transcendence</h1>
          <LoginForm />
          <ErrorMessage message={errorMessage} />
          <h1 className="text-1xl text-center">
            Don't have an account yet?{' '}
            <StylisedLink to="/register">Sign up</StylisedLink>
          </h1>
          <Separator />
          <OauthLoginOptions />
        </div>
      </div>
    </>
  );
}
