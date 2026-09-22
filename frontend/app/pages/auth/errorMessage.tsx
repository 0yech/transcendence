import { errorCardStyle } from '~/styles/style';
import { twMerge } from 'tailwind-merge';

/**
 * Displays an error message on the login/register pages.
 */
export function ErrorMessage(props: { message?: string | null }) {
  const { message: errorMessage } = props;

  return (
    <>
      {errorMessage ? (
        <p className={twMerge(errorCardStyle, 'mt-2')}>{errorMessage}</p>
      ) : null}
    </>
  );
}
