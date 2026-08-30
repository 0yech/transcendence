import type {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ReactNode,
} from 'react';
import { Link, type LinkProps } from 'react-router';
import { twMerge } from 'tailwind-merge';

const buttonStyles = {
  primary:
    'bg-linear-to-r from-blue to-pink hover:bg-linear-to-r hover:from-pink hover:to-orange',
  accept:
    'bg-linear-to-r from-blue to-accept hover:bg-linear-to-r hover:from-mid-dark-blue hover:to-accept-active',
  danger: 'bg-danger hover:bg-danger-active',
} as const;

const baseStyle =
  'text- flex justify-center items-center p-2 rounded-full hover:cursor-pointer hover:scale-105 active:scale-95 transition-all duration-500 ease-out';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: keyof typeof buttonStyles;
};

export function Button({
  children,
  onClick,
  className,
  variant = 'primary',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={twMerge(baseStyle, buttonStyles[variant], className)}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: keyof typeof buttonStyles;
};

export function ButtonLink({
  children,
  className,
  variant = 'primary',
  ...rest
}: ButtonLinkProps) {
  return (
    <a
      className={twMerge(baseStyle, buttonStyles[variant], className)}
      {...rest}
    >
      {children}
    </a>
  );
}

type ButtonLinkInProps = LinkProps & {
  variant?: keyof typeof buttonStyles;
};

export function ButtonLinkIn({
  children,
  className,
  variant = 'primary',
  ...rest
}: ButtonLinkInProps) {
  return (
    <Link
      className={twMerge(baseStyle, buttonStyles[variant], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}
