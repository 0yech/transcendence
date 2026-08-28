export function OauthLoginOptions() {
  return (
    <div>
      <a
        className="block rounded-full w-fit px-5 bg-blue-500 hover:bg-green-700"
        href="/api/auth/google"
      >
        Login with Google
      </a>
      <a
        className="block rounded-full w-fit px-5 bg-blue-500 hover:bg-green-700"
        href="/api/auth/fortytwo"
      >
        Login with 42
      </a>
      <a
        className="block rounded-full w-fit px-5 bg-blue-500 hover:bg-green-700"
        href="/api/auth/github"
      >
        Login with GitHub
      </a>
    </div>
  );
}
