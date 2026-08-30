import { Form } from 'react-router';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export function LoginForm() {
  return (
    <>
      <Form className="flex flex-col gap-3" method="post" action="/login">
        <Input
          type="text"
          name="username"
          id="username"
          placeholder="Username"
          autoComplete="username"
          required
        >
          Your username
        </Input>
        <Input
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          autoComplete="password"
          required
        >
          Your Password
        </Input>
        <Button variant="accept" className="text-3xl w-80" type="submit">
          Login
        </Button>
      </Form>
    </>
  );
}
