/**
 * Displays an error message on the login/register pages.
 */
export function ErrorMessage(props: { message: string | null }) {
  const { message: errorMessage } = props;

  if (errorMessage === null) {
    return null;
  }

  return (
    <>
      <p className="text-red-500 font-bold">{errorMessage}</p>
    </>
  );
}
