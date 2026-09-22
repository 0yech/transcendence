import type { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';
import { textCardStyle } from '~/styles/style';

const BaseStyle = 'p-2';

const InputStyles = {
  primary:
    'w-80 bg-linear-to-r from-dark-gray/70 text-center text-3xl to-dark-blue/70 border border-light-gray rounded-full placeholder-gray',
  textarea: `${textCardStyle} text-md min-h-10 rounded-xl placeholder-light-gray`,
} as const;

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: keyof typeof InputStyles;
  labelClassName?: string;
  id: string;
};

export function Input({
  children,
  className,
  id,
  labelClassName = 'sr-only',
  variant = 'primary',
  ...rest
}: InputProps) {
  return (
    <>
      <label htmlFor={id} className={labelClassName}>
        {children}
      </label>
      <input
        className={twMerge(BaseStyle, InputStyles[variant], className)}
        {...rest}
        id={id}
      />
    </>
  );
}

export function AvatarChange({ children, className, id, ...rest }: InputProps) {
  return (
    <>
      <label htmlFor={id} className={twMerge('relative', className)}>
        {children}
      </label>
      <input className={twMerge(BaseStyle, 'sr-only ')} {...rest} id={id} />
    </>
  );
}
