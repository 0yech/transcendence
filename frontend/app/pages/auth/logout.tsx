import { useFetcher } from 'react-router';
import { ErrorMessage } from './errorMessage';

export function LogoutButton() {
  const fetcher = useFetcher();
  // We use fetcher.Form to prevent navigation to the /logout URL

  let errorMessage = null;
  if (fetcher.data) {
    errorMessage = fetcher.data.errorMessage;
  }
  return (
    <>
      <fetcher.Form method="post" action="/logout">
        <div>
          <button
            className="rounded-full w-fit px-5 bg-red-500 hover:bg-red-700"
            type="submit"
          >
            Logout
          </button>
        </div>
      </fetcher.Form>

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
    </>
  );
}
