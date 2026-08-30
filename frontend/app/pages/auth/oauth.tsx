import { ButtonLink } from '../../components/Button';

export function OauthLoginOptions() {
  return (
    <div className="flex flex-col gap-3 w-fit h-fit">
      <ButtonLink href="/api/auth/google" className="text-3xl w-80">
        Login with Google
      </ButtonLink>
      <ButtonLink href="/api/auth/fortytwo" className="text-3xl w-80">
        Login with 42
      </ButtonLink>
      <ButtonLink href="/api/auth/github" className="text-3xl w-80">
        Login with GitHub
      </ButtonLink>
    </div>
  );
}
