import { LoginForm } from '../auth/login';
import type { Route } from '../+types/root';

export async function clientAction({ request }: Route.ActionArgs) {
  const data = await request.formData();
  await fetch('http://127.0.0.1:3000/auth/login', {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(data)),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  }).then((response) => {
    const body = response.json();
    console.log(body);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    return body;
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
