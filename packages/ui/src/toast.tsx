'use client';

import {
  animate,
  AnimatePresence,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import * as motion from 'motion/react-client';
import {
  createContext,
  type CSSProperties,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Button } from './button';
import { XIcon } from './icons/x';
import { cn } from './lib/cn';
import { DURATION, EASE, SPRING } from './lib/motion';

export type ToastOptions = {
  title: ReactNode;
  description?: ReactNode;
  /** `error`는 즉시 읽히고(assertive), 기본은 조용히 읽힙니다(polite). */
  variant?: 'default' | 'error';
  /** 자동으로 닫히기까지 걸리는 시간(ms). 기본 5000. 호버·포커스 중에는 멈춥니다. */
  duration?: number;
  /**
   * 토스트 안의 동작. 사라져도 같은 일을 할 다른 길이 있는 동작에만 쓰십시오.
   * 사용자의 응답이 꼭 필요하면 토스트가 아니라 `Dialog`를 쓰십시오.
   */
  action?: { label: string; onClick: () => void };
};

type ToastItem = ToastOptions & { id: string };

type ToastContextValue = {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast는 ToastProvider 안에서만 쓸 수 있습니다.');
  return context;
}

export type ToastProviderProps = {
  children: ReactNode;
  /** 알림 영역의 이름 (스크린 리더용) */
  label?: string;
  /** 단축키(`KeyboardEvent.key`)를 누르면 알림 영역으로 포커스가 옵니다. 끄려면 null. */
  hotkey?: string | null;
  /** 동시에 보여 줄 최대 개수. 넘치면 오래된 것부터 닫습니다. */
  limit?: number;
  dismissLabel?: string;
  /** 알림 영역의 위치를 바꾸는 클래스(예: 화면 아래에 붙은 막대 위로 올리는 `bottom-24`). 기본은 화면 아래 끝입니다. */
  viewportClassName?: string;
  /** 오류 알림을 스크린 리더가 읽을 때 앞에 붙는 말 */
  errorPrefix?: string;
};

const DEFAULT_DURATION = 5000;

/** 옆으로 밀어 닫는 거리 기준: 카드 너비의 이 비율을 넘게 밀거나, */
const SWIPE_DISTANCE = 0.35;
/** 밀던 방향으로 이 속도(px/s)보다 빠르게 쓸면 닫힙니다. */
const SWIPE_VELOCITY = 500;
/** 속도로 닫으려면 적어도 이만큼(px) 움직여야 합니다. 스치기만 해서 닫히지 않게 합니다. */
const SWIPE_FLICK_MIN = 24;
/** 밀기를 시작하지 않는 곳: 누르거나 입력하는 요소. 글에 이런 요소가 들어 있어도 누르려던 손가락이 카드를 끌지 않는다. */
const DRAG_IGNORE =
  'button, a, input, select, textarea, label, summary, [role="button"], [contenteditable="true"], [tabindex]:not([data-toast])';

/** 겹쳐 쌓였을 때 뒤쪽 알림이 앞 알림 위로 비치는 높이(px)와, 한 단계 뒤로 갈 때마다 줄어드는 비율. */
const STACK_PEEK = 10;
const STACK_SHRINK = 0.05;
/** 마우스가 알림 영역을 벗어난 뒤 이 시간(ms) 안에 돌아오면 접히지 않는다(카드 사이 틈을 지나가도 깜박이지 않게). */
const COLLAPSE_DELAY = 160;
/** 마우스를 올린 뒤 이 시간(ms)이 지나야 펼친다(스치기만 하면 펼쳐지지 않게). */
const EXPAND_DELAY = 30;
/** 펼치고 접을 때 뒤쪽 카드일수록 이만큼(초)씩 늦게 움직여, 앞 카드에서 부채처럼 펼쳐지게 한다. */
const FAN_STAGGER = 0.018;

/** 응답을 놓치면 안 되는 알림(동작이 있거나 오류)은 자동으로 닫지 않습니다. */
function durationOf(item: ToastOptions) {
  return item.duration ?? (item.action || item.variant === 'error' ? Infinity : DEFAULT_DURATION);
}

function textOf(item: ToastItem, errorPrefix: string) {
  const prefix = item.variant === 'error' ? errorPrefix : '';
  return `${prefix}${typeof item.title === 'string' ? item.title : ''}${
    typeof item.description === 'string' ? `. ${item.description}` : ''
  }`;
}

/**
 * 앱 한 곳을 감싸면 `useToast()`로 어디서든 알림을 띄울 수 있습니다.
 * 읽어 주는 일은 화면에 안 보이는 라이브 리전(항상 DOM에 있음)이 맡고, 화면의 알림 카드는 읽기와 무관하게 키보드로 닿습니다.
 * 모달(`Dialog`, `Sheet`)이 열려 있는 동안에는 뒤 화면이 스크린 리더와 키보드에서 가려지므로 알림에 닿지 못합니다.
 */
export function ToastProvider({
  children,
  label = '알림',
  hotkey = 'F8',
  limit = 3,
  dismissLabel = '알림 닫기',
  viewportClassName,
  errorPrefix = '오류: ',
}: ToastProviderProps) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  // 알림이 둘 이상이면 평소에는 겹쳐 쌓고, 마우스를 올리거나 포커스가 들어오면 세로 목록으로 펼친다.
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  // 터치와 펜에는 마우스를 올리고 벗어나는 일이 없어, 눌러서 펼친다. 영역 밖을 누르면 접힌다.
  const [pinned, setPinned] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expandTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [frontEl, setFrontEl] = useState<HTMLLIElement | null>(null);
  const [frontHeight, setFrontHeight] = useState(0);
  const expanded = hovered || focusWithin || pinned;
  // 자동으로 닫히지 않는 알림(오류, 동작이 있는 알림)은 뒤로 숨으면 무슨 말인지 볼 수 없어 겹치지 않는다. 모두 곧 닫히는 알림일 때만 겹친다.
  const stacked =
    items.length > 1 && !expanded && items.every((item) => Number.isFinite(durationOf(item)));

  // 겹쳤을 때 뒤쪽 알림을 맨 앞(가장 새) 알림의 높이에 맞춰 자르려고 그 높이를 잰다.
  useEffect(() => {
    if (!frontEl) return;
    // 관찰을 시작하면 첫 통지가 와서 처음 높이도 여기서 정해진다.
    const observer = new ResizeObserver(() => setFrontHeight(frontEl.offsetHeight));
    observer.observe(frontEl);
    return () => observer.disconnect();
  }, [frontEl]);

  useEffect(
    () => () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
      if (expandTimer.current) clearTimeout(expandTimer.current);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    const viewport = viewportRef.current;
    const hadFocus = viewport?.contains(document.activeElement) ?? false;
    setItems((current) => current.filter((item) => item.id !== id));
    // 포커스가 있던 알림이 사라지면 body로 떨어지지 않게 F8을 누르기 전 자리로 돌려 보낸다.
    if (hadFocus) {
      // 사라지는 요소에서는 포커스를 잃는 이벤트가 오지 않을 수 있어, 펼침이 고착되지 않게 여기서 푼다.
      setFocusWithin(false);
      const target = returnFocus.current;
      returnFocus.current = null;
      if (target && document.contains(target)) target.focus();
    }
  }, []);

  const toast = useCallback(
    (options: ToastOptions) => {
      counter.current += 1;
      const id = `toast-${counter.current}`;
      setItems((current) => [...current, { ...options, id }].slice(-limit));
      return id;
    },
    [limit],
  );

  const newestId = items.at(-1)?.id;

  useEffect(() => {
    if (!hotkey) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== hotkey || event.repeat || event.defaultPrevented) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      // 알림이 없으면 보이지 않는 곳으로 포커스를 보내지 않는다.
      // 겹쳐 쌓였을 때 화면에 보이는 것은 가장 새 알림이라 그쪽으로 보낸다(포커스가 들어오면 펼쳐진다).
      // 사라지는 중인 알림이 목록 끝에 남아 있을 수 있어, 위치가 아니라 가장 새 알림의 번호로 찾는다.
      const newest = viewportRef.current?.querySelector<HTMLElement>(
        `[data-toast-id="${newestId}"]`,
      );
      if (!newest) return;
      returnFocus.current = document.activeElement as HTMLElement | null;
      newest.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hotkey, newestId]);

  // 터치로 펼친 것은 영역 밖을 누르면 접는다.
  useEffect(() => {
    if (!pinned) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!viewportRef.current?.contains(event.target as Node)) setPinned(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [pinned]);

  // 알림이 모두 사라지면 펼침 상태를 모두 푼다(사라진 요소에서는 마우스를 벗어나는 일이나 포커스를 잃는 일이 오지 않을 수 있다).
  if (items.length === 0 && (hovered || focusWithin || pinned)) {
    setHovered(false);
    setFocusWithin(false);
    setPinned(false);
  }
  if (items.length < 2 && pinned) setPinned(false);

  // 화면에는 안 보이는 라이브 리전. 새 알림 하나당 노드를 새로 넣어 같은 문구도 다시 읽힌다.
  const polite = items.filter((item) => item.variant !== 'error').at(-1);
  const assertive = items.filter((item) => item.variant === 'error').at(-1);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);
  const regionLabel = hotkey ? `${label} (${hotkey})` : label;

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {polite ? <span key={polite.id}>{textOf(polite, errorPrefix)}</span> : null}
      </div>
      <div role="alert" className="sr-only">
        {assertive ? <span key={assertive.id}>{textOf(assertive, errorPrefix)}</span> : null}
      </div>
      <div
        ref={viewportRef}
        role="region"
        aria-label={regionLabel}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setFocusWithin(false);
          // 알림 영역을 완전히 떠나면 기억해 둔 자리를 버린다(나중에 엉뚱한 곳으로 돌려 보내지 않게).
          // 빈 곳을 눌러 포커스가 아무 데도 없게 된 경우(`relatedTarget`이 null)도 버린다. 다만 창이나 탭을 바꿔 생긴 blur는 돌아오면
          // 같은 자리에 포커스가 남으므로 `document.hasFocus()`가 거짓일 때는 둔다.
          const to = event.relatedTarget as HTMLElement | null;
          const left = to ? !event.currentTarget.contains(to) : document.hasFocus();
          if (left) returnFocus.current = null;
        }}
        onFocus={(event) => {
          // 키보드로 닿은 포커스만 펼친다. 마우스나 탭으로 생긴 포커스는 타이머를 멈추거나 펼침을 붙잡지 않는다.
          setFocusWithin((event.target as HTMLElement).matches(':focus-visible'));
          // F8이 아니라 탭이나 Tab으로 알림에 닿아도, 그 알림이 사라질 때 이전 자리로 돌려 보낼 수 있게 기억해 둔다.
          const from = event.relatedTarget as HTMLElement | null;
          if (!returnFocus.current && from && !event.currentTarget.contains(from)) {
            returnFocus.current = from;
          }
        }}
        className={cn(
          'pointer-events-none fixed inset-x-0 bottom-0 z-60 flex flex-col items-center p-4 sm:items-end',
          viewportClassName,
        )}
      >
        {/* list-style: none 이면 Safari/VoiceOver 가 목록 역할을 버리므로 role 을 명시한다 */}
        {/* eslint-disable-next-line jsx-a11y/no-redundant-roles */}
        <ol
          role="list"
          className={cn(
            // 알림 영역 전체(겹쳐 비치는 부분 포함)가 마우스를 받아야 올렸을 때 펼쳐진다. 알림이 없으면 높이가 0이라 아래 화면을 막지 않는다.
            'pointer-events-auto m-0 w-full max-w-sm list-none p-0',
            stacked ? 'grid' : 'flex flex-col gap-2',
          )}
          style={
            {
              '--toast-front-h': frontHeight > 0 ? `${frontHeight}px` : 'auto',
              paddingTop: stacked ? (items.length - 1) * STACK_PEEK : 0,
            } as CSSProperties
          }
          onPointerDown={(event) => {
            if (event.pointerType !== 'mouse' && stacked) setPinned(true);
          }}
          onPointerEnter={() => {
            if (collapseTimer.current) clearTimeout(collapseTimer.current);
            if (expandTimer.current) clearTimeout(expandTimer.current);
            // 이미 펼쳐 있으면(접히기 전에 돌아온 경우) 바로 유지하고, 접혀 있으면 잠깐 두었다가 펼친다.
            if (hovered) return;
            expandTimer.current = setTimeout(() => setHovered(true), EXPAND_DELAY);
          }}
          onPointerLeave={() => {
            if (expandTimer.current) clearTimeout(expandTimer.current);
            if (collapseTimer.current) clearTimeout(collapseTimer.current);
            collapseTimer.current = setTimeout(() => setHovered(false), COLLAPSE_DELAY);
          }}
        >
          <AnimatePresence initial={false}>
            {items.map((item, index) => {
              const depth = items.length - 1 - index;
              return (
                <ToastCard
                  key={item.id}
                  item={item}
                  depth={depth}
                  stacked={stacked}
                  expanded={expanded}
                  liRef={depth === 0 ? setFrontEl : undefined}
                  onDismiss={dismiss}
                  dismissLabel={dismissLabel}
                />
              );
            })}
          </AnimatePresence>
        </ol>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  item,
  depth,
  stacked,
  expanded,
  liRef,
  onDismiss,
  dismissLabel,
}: {
  item: ToastItem;
  /** 가장 새 알림이 0이고, 오래될수록 커진다. */
  depth: number;
  /** 겹쳐 쌓인 상태인지(알림이 둘 이상이고 펼치지 않았을 때). */
  stacked: boolean;
  /** 마우스를 올렸거나 포커스가 안에 있어 펼친 상태. 이 동안은 모든 알림의 타이머가 멈춘다. */
  expanded: boolean;
  liRef?: Ref<HTMLLIElement>;
  onDismiss: (id: string) => void;
  dismissLabel: string;
}) {
  const reduceMotion = useReducedMotion();
  const duration = durationOf(item);
  const remaining = useRef(duration);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 멈춤 이유를 따로 센다. 모두 풀려야 다시 센다.
  const holds = useRef({ hover: false, focus: false, hidden: false, drag: false, stack: false });
  // 터치로 옆으로 밀어 닫는다. 밀리는 동안 카드가 손가락을 따라가고, 멀어질수록 옅어진다.
  const x = useMotionValue(0);
  const swipeOpacity = useTransform(x, [-180, 0, 180], [0.35, 1, 0.35]);
  const dragControls = useDragControls();
  const cardRef = useRef<HTMLDivElement>(null);
  const { id } = item;

  const stop = useCallback(() => {
    if (timer.current === null) return;
    clearTimeout(timer.current);
    timer.current = null;
    remaining.current -= Date.now() - startedAt.current;
  }, []);

  const sync = useCallback(() => {
    const held =
      holds.current.hover ||
      holds.current.focus ||
      holds.current.hidden ||
      holds.current.drag ||
      holds.current.stack;
    if (held) {
      stop();
      return;
    }
    if (timer.current !== null || !Number.isFinite(remaining.current) || remaining.current <= 0) {
      return;
    }
    startedAt.current = Date.now();
    timer.current = setTimeout(() => onDismiss(id), remaining.current);
  }, [id, onDismiss, stop]);

  const hold = useCallback(
    (reason: 'hover' | 'focus' | 'hidden' | 'drag' | 'stack', value: boolean) => {
      holds.current[reason] = value;
      sync();
    },
    [sync],
  );

  // 알림 영역이 펼쳐진 동안에는 뒤쪽 알림도 닫히지 않는다(펼친 사이에 몰래 사라지지 않게).
  useEffect(() => {
    hold('stack', expanded);
  }, [expanded, hold]);

  useEffect(() => {
    holds.current.hidden = document.hidden;
    sync();
    const onVisibility = () => hold('hidden', document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      stop();
    };
  }, [sync, hold, stop]);

  return (
    <motion.li
      ref={liRef}
      // 겹쳤을 때 뒤쪽 카드의 단계 변형(이동·축소)은 쌓임 순서를 따로 만들어, 변형이 없는 앞 카드를 DOM 순서와 상관없이 덮는다.
      // 가장 새 알림이 맨 위에 오도록 깊이에 따라 쌓임 순서를 명시한다.
      style={{ zIndex: Math.max(0, 50 - depth) }}
      data-toast=""
      data-toast-id={item.id}
      tabIndex={-1}
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={
        reduceMotion ? undefined : { opacity: 0, y: 8, transition: { duration: DURATION.fast } }
      }
      transition={{
        duration: DURATION.base,
        ease: EASE.outExpo,
        // 펼치고 접는 이동만 부드러운 스프링으로 하고 뒤쪽 카드일수록 조금 늦게 움직인다(나타나고 사라지는 시간은 그대로).
        layout: { ...SPRING.fan, delay: depth * FAN_STAGGER },
      }}
      onPointerEnter={() => hold('hover', true)}
      onPointerLeave={() => hold('hover', false)}
      onFocus={(event) => {
        // 탭해서 생긴 포커스는 타이머를 멈추지 않는다. 키보드(F8, Tab)로 온 포커스만 읽을 시간을 준다.
        if (event.target.matches(':focus-visible')) hold('focus', true);
      }}
      onBlur={(event) => {
        // 알림 안에서 포커스가 옮겨 갈 때는 멈춘 채로 둔다.
        if (event.currentTarget.contains(event.relatedTarget)) return;
        hold('focus', false);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onDismiss(id);
      }}
      data-variant={item.variant ?? 'default'}
      className={cn(
        'text-foreground pointer-events-auto rounded-lg font-sans text-sm outline-none',
        'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2',
        // 겹쳐 쌓였을 때는 모두 같은 칸에 놓고 아래(앞 알림 쪽)에 맞춘다. 가장 새 알림이 맨 위(앞)에 그려진다.
        'group',
        stacked && 'self-end [grid-area:1/1]',
      )}
    >
      {/* 겹침 단계: 뒤쪽 카드는 앞 알림과 같은 높이로 맞추고 위쪽 가장자리를 기준으로 줄여, 높이가 달라도 위쪽이 단계마다 같은 만큼 비친다. 펼치면 제자리로 돌아온다. */}
      <motion.div
        className={cn('origin-top', stacked && depth > 0 && 'overflow-hidden rounded-lg')}
        style={stacked && depth > 0 ? { height: 'var(--toast-front-h)' } : undefined}
        initial={false}
        animate={
          stacked ? { scale: 1 - depth * STACK_SHRINK, y: -depth * STACK_PEEK } : { scale: 1, y: 0 }
        }
        transition={reduceMotion ? { duration: 0 } : { ...SPRING.fan, delay: depth * FAN_STAGGER }}
      >
        {/* 겉(`li`)은 나타나고 사라지고 자리를 옮기는 일(`layout`)과 포커스 링을 맡고, 안쪽 카드가 밀리는 일을 맡는다. 둘을 한 요소에 두면 끌기와 레이아웃 계산이 겹친다. */}
        <motion.div
          ref={cardRef}
          // 마우스로는 끌지 않는다: 글자를 선택하거나 복사하려는 드래그를 가로채지 않게, 마우스 사용자는 닫기 버튼과 Esc를 쓴다.
          className={cn(
            // 세로 스크롤과 핀치 확대는 브라우저에 남기고 가로 움직임만 가져온다.
            'bg-card touch-pan-y touch-pinch-zoom rounded-lg border p-4',
            stacked && depth > 0 && 'h-full',
            item.variant === 'error' ? 'border-destructive border-2' : 'border-border',
          )}
          style={{ x, opacity: swipeOpacity }}
          drag="x"
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          onPointerDown={(event) => {
            if (event.pointerType === 'mouse' || event.button !== 0) return;
            if ((event.target as HTMLElement).closest(DRAG_IGNORE)) return;
            dragControls.start(event);
          }}
          onDragStart={() => hold('drag', true)}
          onDragEnd={(_, info) => {
            const width = cardRef.current?.offsetWidth ?? 0;
            // 짧게 튕기기만 해도 닫히면 실수로 알림을 잃는다. 속도로 닫는 길은 어느 정도 움직인 뒤에만 열고, 자동으로 닫히지 않는
            // 알림(오류, 동작이 있는 알림)은 거리로만 닫는다.
            const flicked =
              Number.isFinite(duration) &&
              Math.abs(info.offset.x) > SWIPE_FLICK_MIN &&
              Math.abs(info.velocity.x) > SWIPE_VELOCITY &&
              Math.sign(info.velocity.x) === Math.sign(info.offset.x);
            const away = Math.abs(info.offset.x) > width * SWIPE_DISTANCE || flicked;
            if (away) {
              onDismiss(id);
              return;
            }
            hold('drag', false);
            if (reduceMotion) x.set(0);
            else void animate(x, 0, SPRING.snappy);
          }}
        >
          {/* 겹쳐 쌓였을 때 뒤쪽 알림의 글자는 감추고 면만 비치게 한다(앞 알림 위로 글자가 겹쳐 보이지 않게). */}
          <div
            className={cn(
              'flex items-start gap-3 transition-opacity motion-reduce:transition-none',
              // 펼칠 때는 카드가 움직이기 시작한 뒤에 천천히 나타나고, 접힐 때는 바로 사라진다.
              stacked && depth > 0 ? 'opacity-0 duration-150' : 'delay-50 duration-200',
              // 키보드 포커스가 든 카드는 바로 보인다(포커스 링이 투명한 글자 속에 가려지는 시간이 없도록).
              'group-focus-within:opacity-100 group-focus-within:delay-0 group-focus-within:duration-0',
            )}
          >
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="font-medium">{item.title}</p>
              {item.description ? (
                <p className="text-muted-foreground text-caption">{item.description}</p>
              ) : null}
              {item.action ? (
                <div className="mt-2">
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => {
                      item.action?.onClick();
                      onDismiss(id);
                    }}
                  >
                    {item.action.label}
                  </Button>
                </div>
              ) : null}
            </div>
            <Button
              icon
              size="small"
              variant="clear"
              aria-label={dismissLabel}
              // 호버·포커스 때마다 움직이면 소음이라, 알림이 나타날 때 한 번만 그린다.
              iconMotion="mount"
              onClick={() => onDismiss(id)}
              radius="md"
            >
              <XIcon size={16} />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </motion.li>
  );
}
