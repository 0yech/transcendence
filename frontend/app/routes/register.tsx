import { RegisterForm } from '../auth/register';
import type { Route } from '../+types/root';

export async function clientAction({ request }: Route.ActionArgs) {
  const data = await request.formData();
  console.log(JSON.stringify(Object.fromEntries(data)));
  const response = await fetch('http://127.0.0.1:3000/auth/register', {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(data)),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
    }

    return response.blob();
  });
}

export default function Login() {
  return (
    <>
      <title>Register to Transcendence</title>
      <h1>Register to Transcendence</h1>
      <RegisterForm />
      <a href='/login'>Already have an account?</a>
    </>
  );
}
