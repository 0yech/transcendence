import { twMerge } from 'tailwind-merge';
import type { ImgHTMLAttributes } from 'react';

const AvatarStyles = {
  primary: 'w-15 h-15 rounded-full',
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
      src={src ?? srcEmpty}
      {...rest}
    />
  );
}
