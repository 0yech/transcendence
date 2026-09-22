import { twMerge } from 'tailwind-merge';

export const cardStyle =
  'p-5 rounded-4xl bg-blue/20 shadow-xl shadow-dark-blue/30 backdrop-blur-xs';

export const cardDarkStyle =
  'p-5 rounded-4xl bg-dark-blue/30 shadow-xl shadow-dark-blue/30 backdrop-blur-md';

export const textCardStyle =
  'rounded-3xl shadow-lg shadow-dark-gray/50 p-4 bg-dark-gray/60 inset-shadow-sm inset-shadow-black/60 border border-gray';

export const errorCardStyle =
  'rounded-xl bg-red-400/30 backdrop-blur-xs border border-1 border-red-300 text-red-300 p-2 text-md w-full';

export const textTitleStyle = 'md:text-7xl text-5xl font-black';

export const textTitle2Style = 'text-2xl italic';

export const textParaStyle = 'text-md font-book text-white italic';

export const textDiscretStyle = 'text-md font-thin text-mid-light-gray italic';

export const gradientAcceptStyle =
  'bg-linear-to-r from-mid-light-blue to-accept';

export const gradientAcceptHoverStyle =
  'hover:bg-linear-to-r hover:from-green hover:to-accept';

export const gradientDangerStyle = 'bg-linear-to-r from-red-400 to-dark-pink';

export const gradientDangerHoverStyle =
  'hover:bg-linear-to-r hover:from-dark-pink hover:to-pink';

export const gradientStyle = 'bg-linear-to-r from-blue to-pink';

export const gradientHoverStyle =
  'hover:bg-linear-to-r hover:from-pink hover:to-orange';

export const gradientAccentStyle = 'bg-linear-to-r from-blue to-pink';

export const gradientAccentHoverStyle =
  'hover:bg-linear-to-r hover:from-pink hover:to-mid-dark-pink';

export const textMaskStyle = 'bg-clip-text text-transparent';

export function Separator({ className }: { className?: string }) {
  return (
    <>
      <hr
        className={twMerge(
          'w-full px-2 my-1 border-0 h-0.5 rounded-full bg-gray',
          className,
        )}
      />
    </>
  );
}
