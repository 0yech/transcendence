import { Form } from 'react-router';

export function RemoveAccountButton() {
  return (
    <>
      <Form method="post" action="/remove-account">
        <div>
          <button type="submit">Delete account</button>
        </div>
      </Form>
    </>
  );
}
