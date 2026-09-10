'use client';

import { forwardRef } from 'react';

import { Button, type ButtonProps } from './button';

export type IconButtonProps = Omit<ButtonProps, 'icon' | 'display'> & {
  'aria-label': string;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = 'clear', radius = 'md', ...props },
  ref,
) {
  return <Button {...props} ref={ref} display="inline" icon radius={radius} variant={variant} />;
});
