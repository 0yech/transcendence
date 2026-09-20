import { useFetcher } from 'react-router';
import { ErrorMessage } from './errorMessage';

export function LogoutButton({ className }: { className?: string }) {
  const fetcher = useFetcher();
  // We use fetcher.Form to prevent navigation to the /logout URL

  let errorMessage = null;
  if (fetcher.data) {
    errorMessage = fetcher.data.errorMessage;
  }
  return (
    <>
      <fetcher.Form method="post" action="/logout">
        <button type="submit" className={className}>
          Logout
        </button>
      </fetcher.Form>

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
    </>
  );
}
