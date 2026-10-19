'use client';

import { AnimatePresence, useReducedMotion } from 'motion/react';
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
import { DURATION, EASE } from './lib/motion';

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
  // 멈춤 이유를 따로 센다. 셋이 모두 풀려야 다시 센다.
  const holds = useRef({ hover: false, focus: false, hidden: false });
  const { id } = item;

  const stop = useCallback(() => {
    if (timer.current === null) return;
    clearTimeout(timer.current);
    timer.current = null;
    remaining.current -= Date.now() - startedAt.current;
  }, []);

  const sync = useCallback(() => {
    const held = holds.current.hover || holds.current.focus || holds.current.hidden;
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
    (reason: 'hover' | 'focus' | 'hidden', value: boolean) => {
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
      onFocus={() => hold('focus', true)}
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
        'bg-card text-foreground pointer-events-auto flex items-start gap-3 rounded-lg border p-4 font-sans text-sm outline-none',
        'focus-visible:ring-ring focus-visible:ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2',
        item.variant === 'error' ? 'border-destructive border-2' : 'border-border',
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
        onClick={() => onDismiss(id)}
        radius="md"
      >
        <XIcon size={16} />
      </Button>
    </motion.li>
  );
}
