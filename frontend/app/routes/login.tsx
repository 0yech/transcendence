import { LoginForm } from '../auth/login';
import type { Route } from '../+types/root';
import { Link, redirect } from 'react-router';

export async function clientAction({ request }: Route.ActionArgs) {
  const data = await request.formData();
  await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(data)),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status} ${response.statusText}`,
        );
      }
      throw redirect('/profile');
    })
    .catch((error) => {
      if (error instanceof Error) {
        console.error('Error logging in: ', error);
      } else {
        throw error; // Rethrow a potential redirect
      }
    });
}

export default function Login() {
  return (
    <>
      <title>Login to Transcendence</title>
      <h1>Login to Transcendence</h1>
      <LoginForm />
      <Link to="/register">Don't have an account yet?</Link>
    </>
  );
}
