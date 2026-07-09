import { Form } from 'react-router';

export function LogoutButton() {
  return (
    <>
      <Form method="post" action="/logout">
        <div>
          <button type="submit">Logout</button>
        </div>
      </Form>
    </>
  );
}
