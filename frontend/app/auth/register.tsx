import { Form } from 'react-router';

export function RegisterForm() {
  return (
    <>
      <Form method="post" action="/register">
        <div>
          <label htmlFor="username">Enter your email address: </label>
          <input type="email" name="email" id="email" required />
        </div>
        <div>
          <label htmlFor="username">Enter your username: </label>
          <input type="text" name="username" id="username" required />
        </div>
        <div>
          <label htmlFor="password">Enter your password: </label>
          <input type="password" name="password" id="password" required />
        </div>
        <div>
          <button type="submit">Register</button>
        </div>
      </Form>
    </>
  );
}
