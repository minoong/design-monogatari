'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  animate,
  AnimatePresence,
  type MotionValue,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
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
  useImperativeHandle,
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
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  useDialogClose,
  useDialogOpen,
} from '@/ui/dialog';
import { cn } from '@/lib/utils';
import { DURATION, EASE, SPRING } from '@/lib/motion';

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
  /**
   * 아래 시트가 멈추는 높이들. 화면 높이에 대한 비율(0보다 크고 1 이하), 오름차순이다(예: `[0.4, 0.85]`). 가장 큰 값이 시트의
   * 높이이고, 처음에는 `defaultSnapIndex`번 높이만큼 보인다. 끌어 놓으면 가장 가까운 높이로 맞춰지고, 가장 낮은 높이보다 더
   * 내려놓으면 닫힌다. 가장 큰 높이가 아닐 때는 본문이 스크롤하지 않고 본문을 위아래로 끌어 높이를 바꾼다. `handle`이 켜진
   * 아래 시트에서만 뜻이 있다.
   */
  snapPoints?: number[];
  /** `snapPoints` 중 처음에 보이는 높이의 번호. 기본 0(가장 낮은 높이). */
  defaultSnapIndex?: number;
  /** 높이가 바뀔 때 새 높이(`snapPoints`의 값)로 부른다. */
  onSnapPointChange?: (point: number) => void;
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
 * 안쪽 `SheetContent`가 열릴 때 자기 "열린 정도"(0은 닫힘, 1은 완전히 열림)를 `register()`로 등록하고 닫히면 해제한다. 바깥 시트의 크기는
 * 이 값에서 바로 계산하므로, 안쪽 시트를 끌어 내리는 만큼 바깥 시트가 원래 크기로 돌아오고 다시 올리면 작아진다.
 */
const NestedSheetContext = createContext<{
  register: (openness: MotionValue<number>) => () => void;
} | null>(null);

/** 안쪽 시트가 완전히 열려 있을 때 바깥 시트가 줄어드는 비율. 안쪽이 닫혀 가는 정도에 따라 이 값에서 0으로 줄어든다. */
const NESTED_SCALE_STEP = 0.05;

/**
 * 안쪽 시트가 화면에 있는 동안 자기 열린 정도를 바깥 시트에 알린다. `open`이 꺼질 때가 아니라 시트가 퇴장 애니메이션을 마치고 사라질 때
 * 해제해야 하므로, 시트 요소 안에 두어 요소와 함께 사라지게 한다(`open`으로 해제하면 닫히는 슬라이드가 끝나기 전에 바깥 시트가 1로 튄다).
 */
function NestedRegistrar({ openness }: { openness: MotionValue<number> }) {
  const parent = useContext(NestedSheetContext);
  useEffect(() => parent?.register(openness), [parent, openness]);
  return null;
}

/** 본문 맨 위에서 아래로 이만큼(px) 끌면 스크롤이 아니라 시트 끌기로 넘어간다. */
const HANDOFF_SLOP = 6;

/**
 * 스크롤되는 시트 내용. 시트가 끌어서 닫히는 동안에도 이 안은 평소처럼 스크롤하고(끌기는 여기서 시작하지 않는다), 시트의 남는
 * 높이만큼만 차지한다. 헤더와 푸터는 이 밖에 두면 스크롤해도 늘 보인다.
 */
export const SheetBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function SheetBody({ className, ...props }, ref) {
    const inner = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => inner.current as HTMLDivElement);
    // 넘칠 때만 키보드로 닿는 자리(tab stop)를 만든다. 스크롤하는 영역은 안에 누를 것이 없으면 키보드로 스크롤할 수 없다.
    const [scrollable, setScrollable] = useState(false);
    useEffect(() => {
      const element = inner.current;
      if (!element) return;
      const check = () => {
        setScrollable(element.scrollHeight > element.clientHeight + 1);
      };
      check();
      const observer = new ResizeObserver(check);
      observer.observe(element);
      Array.from(element.children).forEach((child) => {
        observer.observe(child);
      });
      return () => {
        observer.disconnect();
      };
    }, []);

    return (
      <div
        ref={inner}
        data-sheet-body=""
        // 이름(`aria-label`)을 주면 영역(region)으로 읽힌다. 포커스 링은 안쪽에 그려 스크롤 영역에 잘리지 않게 한다.
        role={props['aria-label'] ? 'region' : undefined}
        tabIndex={scrollable ? 0 : undefined}
        className={cn(
          // 핀치 확대는 막지 않는다(`touch-pinch-zoom`). 가장 큰 높이가 아닌 스냅에서는 본문이 스크롤하지 않고 끌어서 높이를 바꾸므로
          // 세로 스크롤 제스처도 끈다.
          'focus-visible:ring-ring -mx-6 min-h-0 flex-1 touch-pan-y touch-pinch-zoom overflow-y-auto overscroll-contain px-6 select-text group-data-[expanded=false]/sheet:[touch-action:pinch-zoom] group-data-[expanded=false]/sheet:overflow-hidden focus-visible:ring-2 focus-visible:outline-hidden focus-visible:ring-inset',
          className,
        )}
        {...props}
      />
    );
  },
);

/** 닫힐 때 시트가 끝까지 내려가는 시간(초). 투명도는 바꾸지 않고 화면 밖까지 미끄러져서 중간에 사라져 보이지 않는다. */
const EXIT_SECONDS = DURATION.base;

/** 아래로 끌 수 있는 한계(px). 사실상 제한이 없다. */
const DRAG_LIMIT = 100_000;

/** 놓은 뒤 손가락의 속도로 얼마나 더 갈지 미리 보는 시간(초). 스냅 높이를 고를 때 쓴다. */
const PROJECT_SECONDS = 0.25;

/** `SheetTitle`을 안에 꼭 넣으십시오(접근 가능한 이름). 오버레이는 여기서 함께 그립니다. */
export const SheetContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  SheetContentProps
>(function SheetContent(
  {
    side = 'right',
    handle = true,
    snapPoints,
    defaultSnapIndex = 0,
    onSnapPointChange,
    className,
    children,
    ...props
  },
  ref,
) {
  const open = useDialogOpen();
  const close = useDialogClose();
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyDown = useRef<PointerEvent | null>(null);
  // 본문에서 터치로 끌어 넘긴 제스처의 마지막 속도(px/s). 넘기는 동안 첫 움직임은 끌기가 가져가지 못해서 모션의 속도가 모자란다.
  const flickVelocity = useRef(0);
  const y = useMotionValue(0);
  // 시트 높이(px). 배경의 짙기를 계산하는 데 쓴다. 시트가 그려지면 채우고 크기가 바뀌면 다시 채운다.
  const panelHeight = useMotionValue(0);
  // 배경의 짙기를 시트가 내려간 정도에서 바로 계산한다(0%면 가장 짙고 맨 아래까지 내려가면 투명). 끌 때는 배경이 손가락을 따라
  // 옅어지고, 열고 닫을 때도 시트의 움직임과 같은 속도로 짙어지고 옅어진다. `y`는 숫자(px)이거나 `'100%'` 같은 문자열이다.
  const backdrop = useTransform(
    [y, panelHeight],
    ([latest = 0, height = 0]: (string | number)[]) => {
      const raw =
        typeof latest === 'string'
          ? parseFloat(latest) / 100
          : Number(height) > 0
            ? latest / Number(height)
            : 0;
      return 1 - Math.min(1, Math.max(0, Number.isFinite(raw) ? raw : 0));
    },
  );
  const { classes, offset } = SIDES[side];
  const draggable = side === 'bottom' && handle;
  const snaps =
    draggable && snapPoints && snapPoints.length > 0 ? [...snapPoints].sort((a, b) => a - b) : null;
  const [snapIndex, setSnapIndex] = useState(defaultSnapIndex);
  // 이번 누름에서 끌기가 일어났는지. 핸들을 끌었다 놓을 때 이어서 오는 클릭이 높이를 또 바꾸지 않게 한다.
  const dragged = useRef(false);
  const activeSnap = snaps ? Math.min(Math.max(snapIndex, 0), snaps.length - 1) : 0;
  const expanded = !snaps || activeSnap === snaps.length - 1;
  // 시트 높이와 각 높이에서 아래로 내려가 있는 거리(px). 열려 있을 때만 쓰므로 창 높이를 바로 읽는다.
  const viewport = open && snaps ? window.innerHeight : 0;
  const sheetHeight = snaps ? Math.round((snaps[snaps.length - 1] ?? 1) * viewport) : 0;
  const offsetOf = (index: number) =>
    snaps ? sheetHeight - Math.round((snaps[index] ?? 1) * viewport) : 0;

  // 이 시트를 감싼 바깥 시트(있으면)의 등록 통로. 안쪽 시트의 배경 짙기를 바깥 시트에 알리는 데 쓴다.
  const parent = useContext(NestedSheetContext);
  // 안쪽 시트들의 "열린 정도". 합이 클수록 이 시트가 더 작아진다. 값이 바뀔 때마다 이 시트의 크기를 다시 계산한다(렌더 없이).
  const nestedScale = useMotionValue(1);
  const nestedOpenness = useRef(new Set<MotionValue<number>>());
  const canRecede = side === 'bottom' && !reduceMotion;
  const refreshScale = useCallback(() => {
    let openness = 0;
    nestedOpenness.current.forEach((value) => {
      openness += value.get();
    });
    nestedScale.set(canRecede ? 1 - openness * NESTED_SCALE_STEP : 1);
  }, [canRecede, nestedScale]);
  // 안쪽 시트가 있는 동안 이 시트의 윗 테두리를 또렷하게 한다(다크에서 뒤로 물러난 시트가 배경과 거의 같은 색이라 윤곽이 흐렸다).
  const [hasNested, setHasNested] = useState(false);
  const register = useCallback(
    (openness: MotionValue<number>) => {
      nestedOpenness.current.add(openness);
      setHasNested(true);
      const stop = openness.on('change', refreshScale);
      refreshScale();
      return () => {
        stop();
        nestedOpenness.current.delete(openness);
        setHasNested(nestedOpenness.current.size > 0);
        refreshScale();
      };
    },
    [refreshScale],
  );
  const nestedContext = useMemo(() => ({ register }), [register]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    panelHeight.set(panel.offsetHeight);
    const observer = new ResizeObserver(() => {
      panelHeight.set(panel.offsetHeight);
    });
    observer.observe(panel);
    return () => {
      observer.disconnect();
    };
  }, [open, panelHeight]);

  // 터치로 본문(스크롤 영역) 맨 위에서 아래로 끌면 스크롤이 아니라 시트 끌기로 넘긴다. 본문이 더 올라갈 데가 없는데 브라우저가
  // 스크롤을 시작하면 손가락이 허공을 끄는 것이라서, 첫 움직임에서 기본 동작을 막고(`touchmove`는 스크롤이 시작되기 전까지만 취소할 수
  // 있다) 시트가 손가락을 따라가게 한다. 본문이 조금이라도 스크롤된 상태면 아무것도 하지 않아 스크롤이 그대로 일어난다.
  useEffect(() => {
    const panel = panelRef.current;
    if (!draggable || !open || !panel) return;
    let body: HTMLElement | null = null;
    let startY = 0;
    let lastY = 0;
    let lastTime = 0;
    let state: 'idle' | 'candidate' | 'dragging' = 'idle';

    const onTouchStart = (event: TouchEvent) => {
      body = (event.target as HTMLElement).closest('[data-sheet-body]');
      const touch = event.touches[0];
      flickVelocity.current = 0;
      if (!body || !touch || event.touches.length > 1 || body.scrollTop > 0) {
        state = 'idle';
        return;
      }
      startY = lastY = touch.clientY;
      lastTime = event.timeStamp;
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
          // 브라우저가 터치 시작 거리(약 15px) 동안은 첫 움직임을 알려 주지 않아서, 끌기가 시작될 때 이미 손가락이 그만큼 가 있다.
          // 그 거리만큼 시트를 바로 맞춰 처음 몇 px를 건너뛰었다가 한꺼번에 따라붙지 않게 한다. 모션은 끌기를 시작한 점에서부터의
          // 거리를 시트 위치에 더하므로, 시작점을 처음 눌렀던 곳이 아니라 지금 손가락 위치로 알려 준다(그러지 않으면 그 거리가 두 번 더해진다).
          const origin = bodyDown.current;
          dragControls.start({
            type: 'pointerdown',
            pointerId: origin.pointerId,
            pointerType: 'touch',
            isPrimary: true,
            button: 0,
            buttons: 1,
            pageX: touch.pageX,
            pageY: touch.pageY,
            clientX: touch.clientX,
            clientY: touch.clientY,
            target: origin.target,
            currentTarget: origin.currentTarget,
            timeStamp: event.timeStamp,
            preventDefault: () => undefined,
            stopPropagation: () => undefined,
          } as unknown as PointerEvent);
          y.set(delta);
        }
      }
      if (state === 'dragging') {
        const elapsed = event.timeStamp - lastTime;
        if (elapsed > 0) flickVelocity.current = ((touch.clientY - lastY) / elapsed) * 1000;
        lastY = touch.clientY;
        lastTime = event.timeStamp;
        if (event.cancelable) event.preventDefault();
      }
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
  }, [draggable, open, dragControls, y]);

  function handleDragEnd(velocityY: number) {
    // 모션이 잰 속도와 본문에서 넘긴 제스처의 속도 중 더 큰 쪽(방향 포함)을 쓴다. 위로 쓸면 음수라 `Math.max`로 고르면 안 된다.
    const velocity =
      Math.abs(flickVelocity.current) > Math.abs(velocityY) ? flickVelocity.current : velocityY;
    flickVelocity.current = 0;
    if (snaps) {
      // 놓은 자리에서 손가락의 속도로 조금 더 간 곳과 가장 가까운 높이로 맞춘다. 닫힘(맨 아래)도 후보다.
      const projected = y.get() + velocity * PROJECT_SECONDS;
      let best = Math.abs(projected - sheetHeight);
      let target = -1;
      snaps.forEach((_, index) => {
        const distance = Math.abs(projected - offsetOf(index));
        if (distance < best) {
          best = distance;
          target = index;
        }
      });
      if (target === -1) {
        close();
        return;
      }
      setSnapIndex(target);
      // 높이가 바뀌면 `animate`의 `y`가 새 높이로 옮긴다. 같은 높이로 돌아올 때는 값이 안 바뀌어 직접 되돌린다.
      if (target === activeSnap) {
        if (reduceMotion) y.set(offsetOf(target));
        else void animate(y, offsetOf(target), SPRING.sheet);
      }
      const point = snaps[target];
      if (point !== undefined && target !== activeSnap) onSnapPointChange?.(point);
      return;
    }
    const height = panelRef.current?.offsetHeight ?? 0;
    if (y.get() > height * DISMISS_FRACTION || velocity > DISMISS_VELOCITY) {
      // 닫을 때는 놓은 자리에서 그대로 내려간다. 모션이 제자리로 되돌리는 움직임을 따로 시작하지 않게 해 두었다(아래 `dragConstraints`).
      close();
      return;
    }
    if (reduceMotion) y.set(0);
    else void animate(y, 0, SPRING.sheet);
  }

  return (
    <DialogPortal forceMount>
      <AnimatePresence>
        {open ? (
          <DialogPrimitive.Overlay key="sheet-overlay" asChild forceMount>
            {/* 바깥 요소는 열고 닫을 때 시트가 다 내려갈 때까지 남아 있게 하고, 안쪽 층이 시트 위치에 따라 짙기를 바꾼다. */}
            <motion.div
              className="fixed inset-0 z-50"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={
                reduceMotion ? undefined : { opacity: 0, transition: { duration: EXIT_SECONDS } }
              }
              transition={{ duration: DURATION.base, ease: EASE.outExpo }}
            >
              <motion.div
                className={cn('absolute inset-0', parent ? 'bg-overlay/50' : 'bg-overlay')}
                style={{ opacity: backdrop }}
              />
            </motion.div>
          </DialogPrimitive.Overlay>
        ) : null}
        {open ? (
          <DialogPrimitive.Content ref={ref} key="sheet-content" asChild forceMount {...props}>
            <motion.div
              ref={panelRef}
              data-expanded={expanded}
              data-nested={hasNested}
              // 끌 수 있으면 시트는 스크롤하지 않고 `SheetBody`가 스크롤한다. `touch-none`은 끌기 영역에서 브라우저가 세로 제스처를
              // 스크롤로 가져가지 못하게 한다(`SheetBody`는 자기 스크롤이라 `touch-pan-y`로 되돌린다).
              className={cn(
                'group/sheet data-[nested=true]:border-muted-foreground dark:data-[nested=true]:border-muted-foreground/80',
                baseClasses,
                classes,
                // 끌 때 제목 같은 글자가 선택되지 않게 한다(본문은 `SheetBody`가 선택을 되살린다).
                draggable
                  ? [
                      // 핀치 확대는 막지 않는다. 시트가 직접 스크롤할 수 있어야 `SheetBody` 밖의 긴 내용이 잘려 닿지 못하는 일이 없다(스냅 높이가 있을 때는 아래로 내려가 있는 부분을 자르기만 한다).
                      'touch-pinch-zoom select-none',
                      snaps ? 'overflow-clip' : 'overflow-y-auto overscroll-contain',
                    ]
                  : 'overflow-y-auto',
                className,
              )}
              style={{
                y,
                scale: nestedScale,
                transformOrigin: 'bottom center',
                ...(snaps ? { height: sheetHeight, maxHeight: 'none' } : null),
              }}
              // 투명도는 바꾸지 않고 화면 가장자리까지 미끄러져 들어오고 나간다(투명도를 같이 바꾸면 닫힐 때 중간에서 사라져 보였다).
              initial={reduceMotion ? false : { ...offset, ...(snaps ? { y: sheetHeight } : null) }}
              animate={{
                x: 0,
                // 스냅 높이가 있으면 지금 높이만큼 내려간 거리로, 없으면 0으로 간다. 열릴 때도 바뀔 때도 이 값이 움직인다.
                y: snaps ? offsetOf(activeSnap) : 0,
              }}
              exit={
                reduceMotion
                  ? undefined
                  : { ...offset, transition: { duration: EXIT_SECONDS, ease: EASE.inOut } }
              }
              transition={
                reduceMotion ? { duration: 0 } : { duration: DURATION.base, ease: EASE.outExpo }
              }
              // 끌기는 아래로만 늘어나고(위로는 막힘) 손가락을 그대로 따라온다. 시작은 `onPointerDown`에서 정한다(`dragListener` 끔).
              drag={draggable ? 'y' : false}
              dragControls={dragControls}
              dragListener={false}
              // 위쪽만 막고 아래쪽은 사실상 열어 둔다. 아래쪽을 0으로 막으면 놓는 순간 모션이 시트를 제자리로 되돌리는 스프링을 먼저
              // 시작해서, 닫히는 시트가 위로 살짝 올라갔다가 내려갔다. 놓은 뒤의 움직임은 `handleDragEnd`가 모두 정한다.
              dragConstraints={{ top: 0, bottom: DRAG_LIMIT }}
              dragElastic={{ top: 0, bottom: 0 }}
              dragMomentum={false}
              onPointerDown={
                draggable
                  ? (event) => {
                      if (event.button !== 0) return;
                      const target = event.target as HTMLElement;
                      if (target.closest('[data-sheet-body]')) {
                        // 가장 큰 높이가 아니면 본문은 스크롤하지 않으므로 어디서든 끌어서 높이를 바꾼다.
                        if (!expanded) {
                          dragControls.start(event);
                          return;
                        }
                        // 본문에서는 끌기를 바로 시작하지 않는다. 터치로 맨 위에서 아래로 끌면 위의 효과가 이 이벤트로 끌기를 시작한다.
                        bodyDown.current = event.nativeEvent;
                        return;
                      }
                      // 핸들은 버튼이지만 누르면서 끌 수 있어야 한다(눌러서 떼기만 하면 `onClick`이 높이를 바꾼다).
                      if (target.closest(DRAG_IGNORE) && !target.closest('[data-sheet-handle]'))
                        return;
                      dragged.current = false;
                      dragControls.start(event);
                    }
                  : undefined
              }
              onDragStart={() => {
                dragged.current = true;
              }}
              // 스냅 높이가 있는데 가려진 아래쪽 내용으로 키보드 포커스가 오면 가장 큰 높이로 펼친다. 가려진 채 포커스가 있으면 보이지 않는 곳에서 입력하게 된다.
              onFocusCapture={(event) => {
                if (!snaps || expanded) return;
                if ((event.target as HTMLElement).closest('[data-sheet-body]')) {
                  setSnapIndex(snaps.length - 1);
                  const point = snaps[snaps.length - 1];
                  if (point !== undefined) onSnapPointChange?.(point);
                }
              }}
              onDragEnd={(_, info) => {
                handleDragEnd(info.velocity.y);
              }}
            >
              {draggable ? (
                snaps ? (
                  // 높이를 고를 수 있으면 끌기 말고도 키보드와 클릭으로 바꿀 수 있어야 한다: 누를 때마다 다음 높이로, 가장 큰 높이에서는 가장 작은 높이로 간다.
                  <button
                    type="button"
                    data-sheet-handle=""
                    aria-label="시트 높이 바꾸기"
                    onClick={() => {
                      if (dragged.current) return;
                      const next = (activeSnap + 1) % snaps.length;
                      setSnapIndex(next);
                      const point = snaps[next];
                      if (point !== undefined) onSnapPointChange?.(point);
                    }}
                    className="focus-visible:ring-ring -mx-6 -mt-6 flex w-[calc(100%+3rem)] cursor-grab justify-center rounded-t-[inherit] py-3 focus-visible:ring-2 focus-visible:outline-hidden focus-visible:ring-inset active:cursor-grabbing"
                  >
                    <span className="bg-muted-foreground h-1 w-10 rounded-full forced-colors:bg-[ButtonText]" />
                  </button>
                ) : (
                  <div
                    aria-hidden
                    className="-mx-6 -mt-6 flex cursor-grab justify-center py-3 active:cursor-grabbing"
                  >
                    <span className="bg-muted-foreground h-1 w-10 rounded-full forced-colors:bg-[ButtonText]" />
                  </div>
                )
              ) : null}
              <NestedRegistrar openness={backdrop} />
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
