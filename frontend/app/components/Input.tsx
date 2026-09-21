import type { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

const BaseStyle = 'p-2';

const InputStyles = {
  primary:
    'w-80 bg-linear-to-r from-dark-blue text-center text-3xl to-mid-dark-blue border border-light-blue rounded-full placeholder-mid-dark-blue',
  textarea:
    'bg-dark-blue/40 text-xl border border-light-blue min-h-10 rounded-xl placeholder-light-gray',
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
