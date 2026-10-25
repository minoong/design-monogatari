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
  type ReactNode,
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

  const dismiss = useCallback((id: string) => {
    const viewport = viewportRef.current;
    const hadFocus = viewport?.contains(document.activeElement) ?? false;
    setItems((current) => current.filter((item) => item.id !== id));
    // 포커스가 있던 알림이 사라지면 body로 떨어지지 않게 F8을 누르기 전 자리로 돌려 보낸다.
    if (hadFocus) {
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

  useEffect(() => {
    if (!hotkey) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== hotkey || event.repeat || event.defaultPrevented) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      // 알림이 없으면 보이지 않는 곳으로 포커스를 보내지 않는다.
      const first = viewportRef.current?.querySelector<HTMLElement>('[data-toast]');
      if (!first) return;
      returnFocus.current = document.activeElement as HTMLElement | null;
      first.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [hotkey]);

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
          // 알림 영역을 완전히 떠나면 기억해 둔 자리를 버린다(나중에 엉뚱한 곳으로 돌려 보내지 않게).
          // 빈 곳을 눌러 포커스가 아무 데도 없게 된 경우(`relatedTarget`이 null)도 버린다. 다만 창이나 탭을 바꿔 생긴 blur는 돌아오면
          // 같은 자리에 포커스가 남으므로 `document.hasFocus()`가 거짓일 때는 둔다.
          const to = event.relatedTarget as HTMLElement | null;
          const left = to ? !event.currentTarget.contains(to) : document.hasFocus();
          if (left) returnFocus.current = null;
        }}
        onFocus={(event) => {
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
        <ol role="list" className="m-0 flex w-full max-w-sm list-none flex-col gap-2 p-0">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <ToastCard
                key={item.id}
                item={item}
                onDismiss={dismiss}
                dismissLabel={dismissLabel}
              />
            ))}
          </AnimatePresence>
        </ol>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  item,
  onDismiss,
  dismissLabel,
}: {
  item: ToastItem;
  onDismiss: (id: string) => void;
  dismissLabel: string;
}) {
  const reduceMotion = useReducedMotion();
  const duration = durationOf(item);
  const remaining = useRef(duration);
  const startedAt = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 멈춤 이유를 따로 센다. 모두 풀려야 다시 센다.
  const holds = useRef({ hover: false, focus: false, hidden: false, drag: false });
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
      holds.current.hover || holds.current.focus || holds.current.hidden || holds.current.drag;
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
    (reason: 'hover' | 'focus' | 'hidden' | 'drag', value: boolean) => {
      holds.current[reason] = value;
      sync();
    },
    [sync],
  );

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
      data-toast=""
      tabIndex={-1}
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={
        reduceMotion ? undefined : { opacity: 0, y: 8, transition: { duration: DURATION.fast } }
      }
      transition={{ duration: DURATION.base, ease: EASE.outExpo }}
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
      )}
    >
      {/* 겉(`li`)은 나타나고 사라지고 자리를 옮기는 일(`layout`)과 포커스 링을 맡고, 안쪽 카드가 밀리는 일을 맡는다. 둘을 한 요소에 두면 끌기와 레이아웃 계산이 겹친다. */}
      <motion.div
        ref={cardRef}
        // 마우스로는 끌지 않는다: 글자를 선택하거나 복사하려는 드래그를 가로채지 않게, 마우스 사용자는 닫기 버튼과 Esc를 쓴다.
        className={cn(
          // 세로 스크롤과 핀치 확대는 브라우저에 남기고 가로 움직임만 가져온다.
          'bg-card flex touch-pan-y touch-pinch-zoom items-start gap-3 rounded-lg border p-4',
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
      </motion.div>
    </motion.li>
  );
}
