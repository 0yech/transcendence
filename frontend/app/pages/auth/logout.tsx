import { useFetcher } from 'react-router';
import { ErrorMessage } from './errorMessage';
import { Button } from '../../components/Button';

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
          <Button variant="danger" type="submit">
            Logout
          </Button>
        </div>
      </fetcher.Form>

      {errorMessage ? <ErrorMessage message={errorMessage} /> : null}
    </>
  );
}
