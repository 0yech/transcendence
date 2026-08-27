import { Form } from 'react-router';

export function LogoutButton() {
  return (
    <>
      <Form method="post" action="/logout">
        <div>
          <button
            className="rounded-full w-fit px-5 bg-red-500 hover:bg-red-700"
            type="submit"
          >
            Logout
          </button>
        </div>
      </Form>
    </>
  );
}
