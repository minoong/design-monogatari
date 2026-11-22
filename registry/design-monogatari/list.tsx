'use client';

import { type HTMLMotionProps, useReducedMotion } from 'motion/react';
import * as motion from 'motion/react-client';
import {
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';
import { DURATION, EASE, reducedTransition, STAGGER } from '@/lib/motion';

type ListContextValue = {
  selectable: boolean;
  value: string | undefined;
  /** 방향키로 옮겨 다니는 한 항목만 Tab으로 닿는다. 그 항목의 값 */
  tabStop: string | undefined;
  select: (value: string) => void;
};

const ListContext = createContext<ListContextValue | null>(null);

function useList() {
  const context = useContext(ListContext);
  if (!context) throw new Error('ListItem은 List 안에서만 쓸 수 있습니다.');
  return context;
}

type ListName =
  | { 'aria-label': string; 'aria-labelledby'?: never }
  | { 'aria-labelledby': string; 'aria-label'?: never };

type ListBaseProps = Omit<
  HTMLMotionProps<'ul'>,
  'children' | 'role' | 'defaultValue' | 'onChange' | 'aria-label' | 'aria-labelledby'
> & {
  /** 항목 사이 등장 지연(초). 기본 `STAGGER.base`(0.04). 감소 모션이면 0 */
  stagger?: number;
  children: ReactNode;
};

export type ListProps = ListBaseProps &
  (
    | {
        /** 켜면 항목 하나를 고르는 `listbox`가 됩니다. 끄면 차례로 나타나기만 하는 목록입니다. */
        selectable?: false;
        /** 보여주기만 하는 목록의 이름. 주지 않아도 됩니다. */
        'aria-label'?: string;
        'aria-labelledby'?: string;
        value?: never;
        defaultValue?: never;
        onValueChange?: never;
      }
    | (ListName & {
        selectable: true;
        /** 선택된 항목의 `value`(제어). 주지 않으면 `defaultValue`로 시작하는 비제어입니다. */
        value?: string;
        defaultValue?: string;
        /** 선택이 바뀔 때 새 항목의 `value`와 함께 호출됩니다. */
        onValueChange?: (value: string) => void;
      })
  );

/** 선택할 수 있는 항목들. 사라진 항목이나 비활성 항목은 건너뛴다. */
function enabledOptions(list: HTMLElement | null) {
  return list
    ? Array.from(list.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])'))
    : [];
}

// 타입어헤드 입력이 이어지는 시간(ms). 이보다 오래 멈추면 처음부터 다시 맞춘다.
const TYPEAHEAD_RESET = 500;

/**
 * 항목이 위에서 아래로 차례로 나타나는 목록. 첫 그림에서만 재생하고, 나중에 추가된 항목은 지연 없이 나타난다.
 * `selectable`이면 항목 하나를 고르는 `listbox`(방향키·Home·End·글자 입력으로 이동, Enter·Space로 선택)가 되고,
 * 아니면 `list`다. 첫 화면 위쪽에 있는 내용에는 쓰지 않는다: 자바스크립트가 실행되기 전까지 항목이 숨겨져 있다.
 */
export function List({
  selectable = false,
  value: valueProp,
  defaultValue,
  onValueChange,
  stagger = STAGGER.base,
  className,
  children,
  onKeyDown,
  onFocus,
  ...props
}: ListProps) {
  const reduce = useReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);
  const [inner, setInner] = useState(defaultValue);
  const value = valueProp ?? inner;
  // 마지막으로 포커스가 있던 항목. 목록을 나갔다 들어와도 거기로 돌아온다.
  const [focused, setFocused] = useState<string>();
  const [tabStop, setTabStop] = useState<string>();
  const typed = useRef({ text: '', timer: 0 });

  const select = useCallback(
    (next: string) => {
      if (valueProp === undefined) setInner(next);
      if (next !== value) onValueChange?.(next);
    },
    [valueProp, value, onValueChange],
  );

  // Tab으로 닿는 항목: 마지막 포커스, 없으면 선택된 항목, 없으면 첫 항목. 항목이 늘거나 줄거나 비활성이 되면 다시 정한다.
  useLayoutEffect(() => {
    if (!selectable) return;
    const options = enabledOptions(listRef.current);
    const pick =
      options.find((option) => option.dataset.value === focused) ??
      options.find((option) => option.dataset.value === value) ??
      options[0];
    setTabStop(pick?.dataset.value);
    // `children`가 바뀌면 항목이 늘거나 줄거나 비활성이 된 것일 수 있다. 같은 값이면 상태가 바뀌지 않아 다시 그리지 않는다.
  }, [selectable, focused, value, children]);

  const move = (key: string, current: HTMLElement | null, event: KeyboardEvent) => {
    const options = enabledOptions(listRef.current);
    if (options.length === 0) return;
    const index = current ? options.indexOf(current) : -1;
    let target: HTMLElement | undefined;
    if (key === 'ArrowDown') target = options[Math.min(index + 1, options.length - 1)];
    else if (key === 'ArrowUp') target = options[Math.max(index - 1, 0)];
    else if (key === 'Home') target = options[0];
    else if (key === 'End') target = options[options.length - 1];
    else return;
    event.preventDefault();
    target?.focus();
  };

  const typeahead = (character: string, current: HTMLElement | null) => {
    const options = enabledOptions(listRef.current);
    const state = typed.current;
    window.clearTimeout(state.timer);
    state.text += character.toLowerCase();
    state.timer = window.setTimeout(() => {
      state.text = '';
    }, TYPEAHEAD_RESET);
    // 같은 글자를 거듭 누르면 그 글자로 시작하는 항목을 차례로 돈다.
    const repeated = [...state.text].every((letter) => letter === state.text[0]);
    const text = repeated ? (state.text[0] ?? '') : state.text;
    const start = current ? options.indexOf(current) + (repeated ? 1 : 0) : 0;
    const ordered = [...options.slice(start), ...options.slice(0, start)];
    ordered.find((option) => option.textContent.trim().toLowerCase().startsWith(text))?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !selectable) return;
    const target = event.target as HTMLElement;
    const current = target.closest<HTMLElement>('[role="option"]');
    if (event.key === 'Enter' || event.key === ' ') {
      if (!current || current.getAttribute('aria-disabled') === 'true') return;
      event.preventDefault();
      if (current.dataset.value !== undefined) select(current.dataset.value);
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      typeahead(event.key, current);
      return;
    }
    move(event.key, current, event);
  };

  const context: ListContextValue = {
    selectable,
    value,
    tabStop: tabStop ?? value,
    select,
  };

  return (
    <ListContext.Provider value={context}>
      <motion.ul
        ref={listRef}
        // 선택하지 않는 목록도 역할을 명시한다: 목록 스타일을 지우면 사파리·VoiceOver가 목록으로 읽지 않는다.
        role={selectable ? 'listbox' : 'list'}
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: reduce ? 0 : stagger } },
        }}
        className={cn(
          'border-border bg-background text-foreground divide-border m-0 divide-y overflow-hidden rounded-lg border p-0 font-sans text-sm',
          className,
        )}
        onKeyDown={handleKeyDown}
        onFocus={(event) => {
          onFocus?.(event);
          const option = (event.target as HTMLElement).closest<HTMLElement>('[role="option"]');
          if (option?.dataset.value !== undefined) setFocused(option.dataset.value);
        }}
        {...props}
      >
        {children}
      </motion.ul>
    </ListContext.Provider>
  );
}

export type ListItemProps = Omit<
  HTMLMotionProps<'li'>,
  'children' | 'role' | 'value' | 'tabIndex' | 'variants'
> & {
  /** `selectable` 목록에서 이 항목의 값. 선택 가능한 목록에서는 꼭 줘야 합니다. */
  value?: string;
  /** 고를 수 없게 합니다. 방향키 이동에서도 건너뜁니다. */
  disabled?: boolean;
  children: ReactNode;
};

/** 목록의 한 줄. 선택 가능한 목록에서는 `option`이고 선택되면 오른쪽에 체크 표시가 나옵니다. */
export function ListItem({
  value,
  disabled = false,
  className,
  children,
  onClick,
  ...props
}: ListItemProps) {
  const list = useList();
  const reduce = useReducedMotion();
  const variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: reducedTransition(reduce, { duration: DURATION.slow, ease: EASE.outExpo }),
    },
  };

  if (!list.selectable) {
    return (
      <motion.li variants={variants} className={cn('px-4 py-3', className)} {...props}>
        {children}
      </motion.li>
    );
  }
  if (value === undefined) {
    throw new Error('selectable List의 ListItem에는 value가 필요합니다.');
  }
  const selected = list.value === value;

  return (
    <motion.li
      {...props}
      variants={variants}
      role="option"
      data-value={value}
      aria-selected={selected}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? undefined : list.tabStop === value ? 0 : -1}
      className={cn(
        'flex min-h-11 cursor-pointer items-center gap-3 px-4 py-3',
        // 호버와 선택이 같은 면이라 선택은 왼쪽 안쪽 막대와 체크가 따로 알린다(라이트에서 `muted`와 `secondary-hover`가 같은 색).
        'not-aria-disabled:hover:bg-secondary-hover aria-selected:bg-secondary-hover aria-selected:shadow-[inset_2px_0_0_0_var(--color-foreground)]',
        'aria-disabled:text-muted-foreground aria-disabled:cursor-not-allowed forced-colors:aria-disabled:text-[GrayText]',
        // 안쪽으로 그려서 `overflow-hidden`인 목록 가장자리에서 잘리지 않는다.
        'focus-visible:outline-ring focus-visible:outline-2 focus-visible:-outline-offset-2',
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && !disabled) list.select(value);
      }}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {/* 선택 표시는 색이 아니라 모양이다. 자리는 항상 잡아 두어 선택이 바뀌어도 줄이 밀리지 않는다. */}
      <svg
        aria-hidden
        className={cn('size-4 shrink-0', selected ? 'opacity-100' : 'opacity-0')}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </motion.li>
  );
}
