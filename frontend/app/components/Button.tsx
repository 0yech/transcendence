import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link, NavLink, type LinkProps, type NavLinkProps } from 'react-router';
import { twMerge } from 'tailwind-merge';
import { motion, type HTMLMotionProps } from 'motion/react';

const buttonStyles = {
  primary:
    'bg-linear-to-r from-blue to-pink hover:bg-linear-to-r hover:from-pink hover:to-orange hover:shadow-lg hover:shadow-mid-light-pink',
  accept:
    'bg-linear-to-r from-blue to-accept hover:bg-linear-to-r hover:from-mid-dark-blue hover:to-accept-active hover:shadow-lg hover:shadow-green',
  danger:
    'bg-linear-to-r from-mid-dark-orange to-danger hover:bg-linear-to-r hover:from-dark-orange hover:to-danger-active hover:shadow-lg hover:shadow-orange',
  oauth: 'justify-start hover:shadow-lg hover:shadow-mid-light-pink',
} as const;

const baseStyle =
  'text-xl flex justify-center items-center p-2 rounded-full hover:cursor-pointer hover:scale-105 active:scale-95 transition-all duration-500 ease-out';

const motionStyle =
  'text-xl flex justify-center items-center p-2 rounded-full hover:cursor-pointer transition-colors';

type ButtonProps = HTMLMotionProps<'button'> & {
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
    <motion.button
      className={twMerge(motionStyle, buttonStyles[variant], className)}
      onClick={onClick}
      {...rest}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring' }}
    >
      {children}
    </motion.button>
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

export const navButtonHoverStyle =
  'hover:text-light-pink hover:drop-shadow-[0_0_8px_rgba(255,145,200,0.7)]';

const buttonNavStyles = {
  primary: navButtonHoverStyle,
  accept: navButtonHoverStyle,
  danger: navButtonHoverStyle,
} as const;

export const navButtonBaseStyle =
  'text-4xl font-bold rounded-b-xl text-xl h-full min-w-40 flex justify-center items-center hover:cursor-pointer transition-all duration-500 ease-out' as const;

export const navButtonActiveStyle =
  'bg-clip-text text-transparent bg-linear-to-r from-blue via-pink to-mid-dark-pink drop-shadow-[0_0_10px_rgba(255,145,200,0.8)]';

type ButtonNavLinkProps = NavLinkProps & {
  variant?: keyof typeof buttonNavStyles;
  className?: string;
};

export function ButtonNavLink({
  children,
  className,
  variant = 'primary',
  ...rest
}: ButtonNavLinkProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        twMerge(
          isActive ? navButtonActiveStyle : '',
          navButtonBaseStyle,
          buttonNavStyles[variant],
          className,
        )
      }
      {...rest}
      viewTransition
    >
      {children}
    </NavLink>
  );
}
