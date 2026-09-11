import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': ['text-title', 'text-body', 'text-caption'],
    },
  },
});

export function cn(...values: ClassValue[]) {
  return twMerge(clsx(values));
}
