/**
 * Displays an error message on the login/register pages.
 */
export function ErrorMessage(props: { message?: string | null }) {
  const { message: errorMessage } = props;

  return (
    <>
      {errorMessage ? (
        <p className="mt-5 rounded-2xl bg-danger/20 px-4 py-3 text-danger">
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}
