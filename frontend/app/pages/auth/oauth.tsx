import { ButtonLink } from '../../components/Button';
import { LogoGoogle, LogoGitHub, Logo42 } from '~/components/Icons';

export function OauthLoginOptions() {
  return (
    <div className="flex flex-col gap-3 w-fit h-fit">
      <ButtonLink
        href="/api/auth/google"
        variant="oauth"
        className="gap-5 bg-[#f2f2f2] text-[#1f1f1f] w-80 h-15"
      >
        <LogoGoogle className="ml-2 size-8" />
        Sign in with Google
      </ButtonLink>
      <ButtonLink
        href="/api/auth/fortytwo"
        variant="oauth"
        className="gap-5 bg-mid-dark-blue text-light-blue w-80 h-15"
      >
        <Logo42 className="ml-2 size-9" />
        Sign in with 42
      </ButtonLink>
      <ButtonLink
        href="/api/auth/github"
        variant="oauth"
        className="gap-5 bg-black text-light-gray w-80 h-15"
      >
        <LogoGitHub className="ml-2 size-9 text-center" />
        Sign in with GitHub
      </ButtonLink>
    </div>
  );
}
