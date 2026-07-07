import { RegisterForm } from '../auth/register';
import type { Route } from '../+types/root';

export async function clientAction({ request }: Route.ActionArgs) {
  const data = await request.formData();
  await fetch('http://127.0.0.1:3000/api/auth/register', {
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
      <title>Register to Transcendence</title>
      <h1>Register to Transcendence</h1>
      <RegisterForm />
      <a href="/login">Already have an account?</a>
    </>
  );
}
