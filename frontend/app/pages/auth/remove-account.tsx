import { useFetcher } from 'react-router';
import { ErrorMessage } from './errorMessage';

export function RemoveAccountButton() {
  const fetcher = useFetcher();
  // We use fetcher.Form to prevent navigation to the /remove-account URL

  let errorMessage = null;
  if (fetcher.data) {
    errorMessage = fetcher.data.errorMessage;
  }

  return (
    <>
      <fetcher.Form method="post" action="/remove-account">
        <div>
          <button type="submit">Delete account</button>
        </div>
      </fetcher.Form>

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
    </>
  );
}
