import { Form } from 'react-router';

export function LoginForm() {
  return (
    <>
      <Form method="post" action="/login">
        <div>
          <label htmlFor="username">Enter your username: </label>
          <input type="text" name="username" id="username" required />
        </div>
        <div>
          <label htmlFor="password">Enter your password: </label>
          <input type="password" name="password" id="password" required />
        </div>
        <div>
          <button type="submit">Login</button>
        </div>
      </Form>
    </>
  );
}
