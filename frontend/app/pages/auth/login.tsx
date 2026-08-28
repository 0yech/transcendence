import { Form } from 'react-router';

export function LoginForm() {
  return (
    <>
      <Form method="post" action="/login">
        <div>
          <label htmlFor="username">Enter your username: </label>
          <input
            className="border rounded-10xl"
            type="text"
            name="username"
            id="username"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Enter your password: </label>
          <input
            className="border rounded-10xl"
            type="password"
            name="password"
            id="password"
            required
          />
        </div>
        <div>
          <button
            className="rounded-full w-fit px-5 bg-green-500 hover:bg-green-700"
            type="submit"
          >
            Login
          </button>
        </div>
      </Form>
    </>
  );
}
