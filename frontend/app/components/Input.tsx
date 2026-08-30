import type { InputHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

const BaseStyle = 'p-2 text-3xl w-80 text-center';

const InputStyles = {
  primary:
    'bg-linear-to-r from-dark-blue to-mid-dark-blue border border-light-blue rounded-full placeholder-mid-dark-blue',
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
