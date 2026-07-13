import { LoginForm } from '../auth/login';
import type { Route } from '../+types/root';
import { Link, redirect } from 'react-router';

export async function clientAction({ request }: Route.ActionArgs) {
  const data = await request.formData();
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(data)),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });
  if (!response.ok) {
    alert(`Error logging in: ${response.status} ${response.statusText}`);
  } else {
    throw redirect('/profile');
  }
}

export default function Login() {
  return (
    <>
      <title>Login to Transcendence</title>
      <h1 className="text-3xl font-bold">Login to Transcendence</h1>
      <LoginForm />
      <Link to="/register">Don't have an account yet?</Link>
    </>
  );
}
