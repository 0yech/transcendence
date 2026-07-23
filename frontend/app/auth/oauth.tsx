export function OauthLoginOptions() {
  return (
    <div>
      <a className="block" href="/api/auth/google">
        Login with Google
      </a>
      <a className="block" href="/api/auth/fortytwo">
        Login with 42
      </a>
      <a className="block" href="/api/auth/github">
        Login with GitHub
      </a>
    </div>
  );
}
