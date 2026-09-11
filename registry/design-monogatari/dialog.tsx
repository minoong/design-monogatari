'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import * as motion from 'motion/react-client';
import {
  createContext,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ElementRef,
  forwardRef,
  type HTMLAttributes,
  useContext,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

const DialogOpenContext = createContext(false);

type DialogProps = ComponentProps<typeof DialogPrimitive.Root>;

export function Dialog({ open: openProp, defaultOpen, onOpenChange, ...props }: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const open = openProp ?? internalOpen;

  function handleOpenChange(nextOpen: boolean) {
    if (openProp === undefined) {
      setInternalOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  }

  return (
    <DialogOpenContext.Provider value={open}>
      <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange} {...props} />
    </DialogOpenContext.Provider>
  );
}

export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export const DialogPortal = DialogPrimitive.Portal;

const overlayClasses = 'bg-overlay fixed inset-0 z-50';
const contentClasses =
  'border-border bg-card text-foreground fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-1/2 gap-4 rounded-lg border p-6';

/** Shared overlay. `DialogContent` already mounts this — do not add a sibling overlay. */
export const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay({ className, ...props }, ref) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <DialogPrimitive.Overlay ref={ref} asChild {...props}>
      <motion.div
        className={cn(overlayClasses, className)}
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={shouldReduceMotion ? undefined : { opacity: 0 }}
        transition={{ duration: 0.15 }}
      />
    </DialogPrimitive.Overlay>
  );
});

/** Include `DialogTitle` inside for the accessible name. Overlay is rendered here. */
export const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(function DialogContent({ className, children, ...props }, ref) {
  const open = useContext(DialogOpenContext);
  const shouldReduceMotion = useReducedMotion();

  return (
    <DialogPortal forceMount>
      <AnimatePresence>
        {open ? <DialogOverlay key="dialog-overlay" forceMount /> : null}
        {open ? (
          <DialogPrimitive.Content ref={ref} key="dialog-content" asChild forceMount {...props}>
            <motion.div
              className={cn(contentClasses, className)}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </DialogPrimitive.Content>
        ) : null}
      </AnimatePresence>
    </DialogPortal>
  );
});

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col gap-1.5 text-center sm:text-left', className)} {...props} />
  );
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

export const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn('text-foreground text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
});

export const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
});
