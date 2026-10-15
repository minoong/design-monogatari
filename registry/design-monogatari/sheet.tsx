'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, useReducedMotion } from 'motion/react';
import * as motion from 'motion/react-client';
import { type ComponentPropsWithoutRef, type ElementRef, forwardRef } from 'react';

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  useDialogOpen,
} from '@/ui/dialog';
import { cn } from '@/lib/utils';
import { DURATION, EASE } from '@/lib/motion';

/** 시트는 `Dialog`와 같은 Radix 대화상자다. 가장자리에서 밀려 나오는 모양만 다르다. */
export const Sheet = Dialog;
export const SheetTrigger = DialogTrigger;
export const SheetClose = DialogClose;
export const SheetHeader = DialogHeader;
export const SheetFooter = DialogFooter;
export const SheetTitle = DialogTitle;
export const SheetDescription = DialogDescription;

export type SheetSide = 'right' | 'left' | 'top' | 'bottom';

const baseClasses =
  'border-border bg-card text-foreground fixed z-50 flex flex-col gap-4 overflow-y-auto p-6 font-sans';

const SIDES: Record<SheetSide, { classes: string; offset: { x?: string; y?: string } }> = {
  right: {
    classes: 'inset-y-0 right-0 h-full w-[calc(100%-2rem)] max-w-md border-l',
    offset: { x: '100%' },
  },
  left: {
    classes: 'inset-y-0 left-0 h-full w-[calc(100%-2rem)] max-w-md border-r',
    offset: { x: '-100%' },
  },
  top: {
    classes: 'inset-x-0 top-0 max-h-[85dvh] rounded-b-lg border-b',
    offset: { y: '-100%' },
  },
  bottom: {
    classes: 'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-lg border-t',
    offset: { y: '100%' },
  },
};

export type SheetContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
  /** 어느 가장자리에서 나오는지. 모바일의 하단 요약은 `bottom`, 데스크톱 슬라이드오버는 `right`입니다. */
  side?: SheetSide;
};

/** `SheetTitle`을 안에 꼭 넣으십시오(접근 가능한 이름). 오버레이는 여기서 함께 그립니다. */
export const SheetContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(function SheetContent({ side = 'right', className, children, ...props }, ref) {
  const open = useDialogOpen();
  const reduceMotion = useReducedMotion();
  const { classes, offset } = SIDES[side];

  return (
    <DialogPortal forceMount>
      <AnimatePresence>
        {open ? <DialogOverlay key="sheet-overlay" forceMount /> : null}
        {open ? (
          <DialogPrimitive.Content ref={ref} key="sheet-content" asChild forceMount {...props}>
            <motion.div
              className={cn(baseClasses, classes, className)}
              initial={reduceMotion ? false : { opacity: 0, ...offset }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={
                reduceMotion
                  ? undefined
                  : { opacity: 0, ...offset, transition: { duration: DURATION.fast } }
              }
              transition={{ duration: DURATION.base, ease: EASE.outExpo }}
            >
              {children}
            </motion.div>
          </DialogPrimitive.Content>
        ) : null}
      </AnimatePresence>
    </DialogPortal>
  );
});
