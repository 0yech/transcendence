import { twMerge } from 'tailwind-merge';
import type { ImgHTMLAttributes } from 'react';

const AvatarStyles = {
  primary: 'h-15 w-15 shrink-0 rounded-full object-cover',
} as const;

const srcEmpty = '/unknown.jpg';

type AvatarProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  variant?: keyof typeof AvatarStyles;
  src?: string | null;
};

export function Avatar({
  className,
  src,
  variant = 'primary',
  ...rest
}: AvatarProps) {
  return (
    <img
      className={twMerge(AvatarStyles[variant], className)}
      referrerPolicy="no-referrer"
      src={src ?? srcEmpty}
      {...rest}
    />
  );
}
