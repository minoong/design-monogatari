'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, useDragControls, useReducedMotion } from 'motion/react';
import * as motion from 'motion/react-client';
import {
  type ComponentPropsWithoutRef,
  createContext,
  type ElementRef,
  forwardRef,
  type HTMLAttributes,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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
  useDialogClose,
  useDialogOpen,
} from './dialog';
import { cn } from './lib/cn';
import { DURATION, EASE } from './lib/motion';

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
  'border-border bg-card text-foreground fixed z-50 flex flex-col gap-4 p-6 font-sans';

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
  /**
   * 위쪽에 잡는 막대(핸들)를 그리고 아래로 끌어 닫을 수 있게 한다. `side="bottom"`에서만 뜻이 있고 기본은 켜짐이다.
   * 끌기는 보조 수단이다: 키보드와 낭독기는 닫기 버튼이나 Esc로 닫는다. 켜져 있으면 시트가 직접 스크롤하지 않으므로
   * 긴 내용은 `SheetBody`로 감싼다(끄면 이전처럼 시트 전체가 스크롤한다).
   */
  handle?: boolean;
};

/** 시트의 이 비율(높이 대비)을 넘게 끌거나 이 속도(px/s)보다 빠르게 쓸어내리면 닫는다. 놓으면 그 밖에는 제자리로 돌아온다. */
const DISMISS_FRACTION = 0.3;
const DISMISS_VELOCITY = 500;

/**
 * 끌기를 시작하지 않는 곳: 스크롤하는 본문(`SheetBody`)과 누르거나 입력하는 요소. 본문에서 시작하면 스크롤과 끌기가 겹치고,
 * 버튼에서 시작하면 누르려던 손가락이 시트를 끈다. 핸들, 제목, 푸터의 빈 곳에서 끌어야 한다.
 */
const DRAG_IGNORE =
  '[data-sheet-body], button, a, input, select, textarea, label, summary, [role="button"], [role="radio"], [role="checkbox"], [contenteditable="true"]';

/**
 * 시트 안에서 다른 시트를 열면 바깥 시트가 한 칸 뒤로 물러난다(살짝 작아진다). 안쪽 시트가 열려 있는 동안 바깥 시트에 알리는 통로다.
 * 안쪽 `SheetContent`가 열릴 때 `register()`로 등록하고 닫히면 해제한다.
 */
const NestedSheetContext = createContext<{ register: () => () => void } | null>(null);

/** 안쪽 시트가 열려 있을 때 바깥 시트가 줄어드는 비율(한 칸마다)과 소요 시간은 `animate`의 `transition`을 따른다. */
const NESTED_SCALE_STEP = 0.05;

/** 본문 맨 위에서 아래로 이만큼(px) 끌면 스크롤이 아니라 시트 끌기로 넘어간다. */
const HANDOFF_SLOP = 6;

/**
 * 스크롤되는 시트 내용. 시트가 끌어서 닫히는 동안에도 이 안은 평소처럼 스크롤하고(끌기는 여기서 시작하지 않는다), 시트의 남는
 * 높이만큼만 차지한다. 헤더와 푸터는 이 밖에 두면 스크롤해도 늘 보인다.
 */
export const SheetBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SheetBody({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-sheet-body=""
        className={cn(
          '-mx-6 min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-6 select-text',
          className,
        )}
        {...props}
      />
    );
  },
);

/** `SheetTitle`을 안에 꼭 넣으십시오(접근 가능한 이름). 오버레이는 여기서 함께 그립니다. */
export const SheetContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(function SheetContent({ side = 'right', handle = true, className, children, ...props }, ref) {
  const open = useDialogOpen();
  const close = useDialogClose();
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyDown = useRef<PointerEvent | null>(null);
  const { classes, offset } = SIDES[side];
  const draggable = side === 'bottom' && handle;
  // 이 시트 안에서 열려 있는 안쪽 시트의 수. 있으면 이 시트가 뒤로 물러난다.
  const parent = useContext(NestedSheetContext);
  const [nested, setNested] = useState(0);
  const register = useCallback(() => {
    setNested((count) => count + 1);
    return () => {
      setNested((count) => count - 1);
    };
  }, []);
  const nestedContext = useMemo(() => ({ register }), [register]);
  useEffect(() => (open ? parent?.register() : undefined), [open, parent]);

  // 터치로 본문(스크롤 영역) 맨 위에서 아래로 끌면 스크롤이 아니라 시트 끌기로 넘긴다. 본문이 더 올라갈 데가 없는데 브라우저가
  // 스크롤을 시작하면 손가락이 허공을 끄는 것이라서, 첫 움직임에서 기본 동작을 막고(`touchmove`는 스크롤이 시작되기 전까지만 취소할 수
  // 있다) 시트가 손가락을 따라가게 한다. 본문이 조금이라도 스크롤된 상태면 아무것도 하지 않아 스크롤이 그대로 일어난다.
  useEffect(() => {
    const panel = panelRef.current;
    if (!draggable || !open || !panel) return;
    let body: HTMLElement | null = null;
    let startY = 0;
    let state: 'idle' | 'candidate' | 'dragging' = 'idle';

    const onTouchStart = (event: TouchEvent) => {
      body = (event.target as HTMLElement).closest('[data-sheet-body]');
      const touch = event.touches[0];
      if (!body || !touch || event.touches.length > 1 || body.scrollTop > 0) {
        state = 'idle';
        return;
      }
      startY = touch.clientY;
      state = 'candidate';
    };
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch || !body || state === 'idle') return;
      const delta = touch.clientY - startY;
      if (state === 'candidate') {
        if (delta < -HANDOFF_SLOP || body.scrollTop > 0) {
          // 위로 쓸거나 이미 스크롤됐다: 스크롤하는 동작이다.
          state = 'idle';
          return;
        }
        if (delta > HANDOFF_SLOP && bodyDown.current) {
          state = 'dragging';
          dragControls.start(bodyDown.current);
        }
      }
      if (state === 'dragging' && event.cancelable) event.preventDefault();
    };
    const onTouchEnd = () => {
      state = 'idle';
    };

    panel.addEventListener('touchstart', onTouchStart, { passive: true });
    panel.addEventListener('touchmove', onTouchMove, { passive: false });
    panel.addEventListener('touchend', onTouchEnd);
    panel.addEventListener('touchcancel', onTouchEnd);
    return () => {
      panel.removeEventListener('touchstart', onTouchStart);
      panel.removeEventListener('touchmove', onTouchMove);
      panel.removeEventListener('touchend', onTouchEnd);
      panel.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [draggable, open, dragControls]);

  return (
    <DialogPortal forceMount>
      <AnimatePresence>
        {open ? <DialogOverlay key="sheet-overlay" forceMount /> : null}
        {open ? (
          <DialogPrimitive.Content ref={ref} key="sheet-content" asChild forceMount {...props}>
            <motion.div
              ref={panelRef}
              // 끌 수 있으면 시트는 스크롤하지 않고 `SheetBody`가 스크롤한다. `touch-none`은 끌기 영역에서 브라우저가 세로 제스처를
              // 스크롤로 가져가지 못하게 한다(`SheetBody`는 자기 스크롤이라 `touch-pan-y`로 되돌린다).
              className={cn(
                baseClasses,
                classes,
                // 끌 때 제목 같은 글자가 선택되지 않게 한다(본문은 `SheetBody`가 선택을 되살린다).
                draggable ? 'touch-none overflow-hidden select-none' : 'overflow-y-auto',
                className,
              )}
              style={{ transformOrigin: 'bottom center' }}
              initial={reduceMotion ? false : { opacity: 0, ...offset }}
              // 안쪽 시트가 열려 있으면 한 칸마다 조금씩 작아져 뒤로 물러난다(아래 시트만). 감소 모션이면 크기를 바꾸지 않는다.
              animate={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: side === 'bottom' && !reduceMotion ? 1 - nested * NESTED_SCALE_STEP : 1,
              }}
              exit={
                reduceMotion
                  ? undefined
                  : { opacity: 0, ...offset, transition: { duration: DURATION.fast } }
              }
              transition={{ duration: DURATION.base, ease: EASE.outExpo }}
              // 끌기는 아래로만 늘어나고(위로는 막힘) 놓으면 제자리로 돌아온다. 시작은 `onPointerDown`에서 정한다(`dragListener` 끔).
              drag={draggable ? 'y' : false}
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.6 }}
              onPointerDown={
                draggable
                  ? (event) => {
                      if (event.button !== 0) return;
                      const target = event.target as HTMLElement;
                      if (target.closest('[data-sheet-body]')) {
                        // 본문에서는 끌기를 바로 시작하지 않는다. 터치로 맨 위에서 아래로 끌면 위의 효과가 이 이벤트로 끌기를 시작한다.
                        bodyDown.current = event.nativeEvent;
                        return;
                      }
                      if (target.closest(DRAG_IGNORE)) return;
                      dragControls.start(event);
                    }
                  : undefined
              }
              onDragEnd={(_, info) => {
                const height = panelRef.current?.offsetHeight ?? 0;
                if (
                  info.offset.y > height * DISMISS_FRACTION ||
                  info.velocity.y > DISMISS_VELOCITY
                ) {
                  close();
                }
              }}
            >
              {draggable ? (
                <div
                  aria-hidden
                  className="-mx-6 -mt-6 flex cursor-grab justify-center py-3 active:cursor-grabbing"
                >
                  <span className="bg-muted-foreground/50 h-1 w-10 rounded-full" />
                </div>
              ) : null}
              <NestedSheetContext.Provider value={nestedContext}>
                {children}
              </NestedSheetContext.Provider>
            </motion.div>
          </DialogPrimitive.Content>
        ) : null}
      </AnimatePresence>
    </DialogPortal>
  );
});
