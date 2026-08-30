import { Link, type LinkProps } from 'react-router';
import { twMerge } from 'tailwind-merge';

const linkStyles = {
  primary:
    'text-1xl text-white underline decoration-pink hover:text-pink transition-colors duration-500',
} as const;

type StylisedLinkProps = LinkProps & {
  variant?: keyof typeof linkStyles;
};

export function StylisedLink({
  children,
  variant = 'primary',
  className,
  ...rest
}: StylisedLinkProps) {
  return (
    <Link className={twMerge(linkStyles[variant], className)} {...rest}>
      {children}
    </Link>
  );
}
