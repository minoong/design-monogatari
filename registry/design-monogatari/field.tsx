'use client';

import { type ComponentProps, type HTMLAttributes } from 'react';

import { Label } from '@/ui/label';
import { cn } from '@/lib/utils';

export function Field({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex w-full flex-col gap-2', className)} {...props} />;
}

export function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return <Label className={className} {...props} />;
}

export function FieldError({
  className,
  children,
  id,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { id: string }) {
  if (!children) {
    return null;
  }

  return (
    <p role="alert" className={cn('text-destructive text-caption', className)} {...props} id={id}>
      {children}
    </p>
  );
}
