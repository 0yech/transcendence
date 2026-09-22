import { RegisterForm } from '../pages/auth/register';
import { ErrorMessage } from '~/pages/auth/errorMessage';
import type { Route } from './+types/register';
import { redirect } from 'react-router';
import { StylisedLink } from '~/components/StylisedLink';
import { OauthLoginOptions } from '~/pages/auth/oauth';
import { NavBar } from '~/components/Navbar';
import {
  cardStyle,
  Separator,
  textTitle2Style,
  textParaStyle,
} from '~/styles/style';
import { twMerge } from 'tailwind-merge';

export async function clientAction({ request }: Route.ActionArgs) {
  const data = await request.formData();
  const response = await fetch('/api/auth/register', {
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
    throw redirect('/login');
  }
}

export default function Register({ actionData }: Route.ComponentProps) {
  let errorMessage = null;
  if (actionData) {
    errorMessage = actionData.errorMessage;
  }

  return (
    <>
      <title>Register to Transcendence</title>
      <NavBar className="fixed"></NavBar>
      <div className="w-full h-dvh flex justify-center items-center">
        <div
          className={twMerge(
            'w-fit h-fit flex flex-col items-center gap-2',
            cardStyle,
          )}
        >
          <h1 className={twMerge(textTitle2Style, 'font-bold')}>Register</h1>
          <RegisterForm />
          <ErrorMessage message={errorMessage} />
          <p className={twMerge(textParaStyle, 'text-center')}>
            Already registered? <StylisedLink to="/login">Sign in</StylisedLink>
          </p>
          <Separator />
          <OauthLoginOptions />
        </div>
      </div>
    </>
  );
}
