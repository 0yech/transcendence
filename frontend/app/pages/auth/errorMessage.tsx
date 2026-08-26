/**
 * Displays an error message on the login/register pages.
 */
export function ErrorMessage(props: { message: string }) {
  const { message: errorMessage } = props;

  return (
    <>
      <p className="text-red-500 font-bold">{errorMessage}</p>
    </>
  );
}
