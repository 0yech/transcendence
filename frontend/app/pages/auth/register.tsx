import { Form } from 'react-router';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export function RegisterForm() {
  return (
    <>
      <Form className="flex flex-col gap-3" method="post" action="/register">
        <Input
          type="email"
          name="email"
          id="email"
          placeholder="Email"
          autoComplete="email"
          required
        >
          Your email
        </Input>
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
        <Button className="text-3xl w-80" variant="accept" type="submit">
          Register
        </Button>
      </Form>
    </>
  );
}
