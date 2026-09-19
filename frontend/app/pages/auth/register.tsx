import { Form } from 'react-router';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';

export function RegisterForm() {
  return (
    <>
      {/*
        These limits mirror RegisterDto in backend/src/auth/dto/register.dto.ts.
        Keep them in sync: the browser check only saves a failed round trip,
        and the backend is what actually enforces the rules.
      */}
      <Form className="flex flex-col gap-3" method="post" action="/register">
        <Input
          type="email"
          name="email"
          id="email"
          placeholder="Email"
          autoComplete="email"
          maxLength={128}
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
          minLength={3}
          maxLength={32}
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
          minLength={8}
          maxLength={64}
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
