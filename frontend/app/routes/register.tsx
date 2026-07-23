import { RegisterForm } from '../auth/register';
import type { Route } from '../+types/root';
import { Link, redirect } from 'react-router';
import { OauthLoginOptions } from '~/auth/oauth';

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
    alert(`Error registering: ${body.message}`);
  } else {
    throw redirect('/login');
  }
}

export default function Register() {
  return (
    <>
      <title>Register to Transcendence</title>
      <h1 className="text-3xl font-bold">Register to Transcendence</h1>
      <RegisterForm />
      <Link to="/login">Already have an account?</Link>

      <OauthLoginOptions />
    </>
  );
}
