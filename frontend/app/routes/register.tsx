import { RegisterForm } from '../pages/auth/register';
import { ErrorMessage } from '~/pages/auth/errorMessage';
import type { Route } from './+types/register';
import { redirect } from 'react-router';
import { StylisedLink } from '~/components/StylisedLink';
import { OauthLoginOptions } from '~/pages/auth/oauth';
import { NavBar } from '~/components/Navbar';

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
      <NavBar></NavBar>
      <div className="w-full h-dvh flex justify-center items-center">
        <div className="p-5 rounded-4xl bg-dark-blue/10 shadow-xl shadow-dark-blue/20 w-fit h-fit flex flex-col items-center gap-2">
          <h1 className="text-2xl text-center">Register to Transcendence</h1>
          <RegisterForm />
          {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
          <h1 className="text-1xl text-center">
            Already have an account?{' '}
            <StylisedLink to="/login">Sign in</StylisedLink>
          </h1>
          <hr className="w-70 my-2 border-0 h-1 rounded-full bg-mid-dark-blue" />
          <OauthLoginOptions />
        </div>
      </div>
    </>
  );
}
