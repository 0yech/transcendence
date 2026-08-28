import { RegisterForm } from '../pages/auth/register';
import { ErrorMessage } from '~/pages/auth/errorMessage';
import type { Route } from './+types/register';
import { Link, redirect } from 'react-router';
import { OauthLoginOptions } from '~/pages/auth/oauth';

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
      <h1 className="text-3xl font-bold">Register to Transcendence</h1>
      <RegisterForm />
      <Link to="/login">Already have an account?</Link>

      <OauthLoginOptions />

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
    </>
  );
}
