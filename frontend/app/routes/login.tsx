import { LoginForm } from '../auth/login';
import type { Route } from '../+types/root';

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
    })
    .catch((error) => {
      console.error('Error logging in: ', error);
    });
}

export default function Login() {
  return (
    <>
      <title>Login to Transcendence</title>
      <h1>Login to Transcendence</h1>
      <LoginForm />
      <a href="/register">Don't have an account yet?</a>
    </>
  );
}
