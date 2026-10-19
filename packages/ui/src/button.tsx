'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, useReducedMotion } from 'motion/react';
import {
  type ButtonHTMLAttributes,
  Children,
  cloneElement,
  type FocusEvent,
  forwardRef,
  Fragment,
  isValidElement,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { cn } from './lib/cn';
import { SPRING } from './lib/motion';

export const buttonVariants = cva(
  'focus-visible:ring-ring relative box-border cursor-pointer appearance-none items-center justify-center border border-transparent font-sans text-base leading-5 font-medium whitespace-nowrap outline-none select-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-40 **:data-icon:inline-flex **:data-icon:shrink-0 **:data-icon:items-center **:data-icon:justify-center [&_svg]:pointer-events-none [&_svg]:block [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-offset-background focus-visible:ring-offset-2',
        // 토글로 쓰면(`aria-pressed`) 켜진 상태를 선택 행과 같은 프라이머리 테두리와 링으로 보인다. 켜진 채로 키보드 포커스가 오면
        // 포커스 링(2px)에 배경색 간격(2px)을 두어 켜짐 링(1px)과 한눈에 구분되게 한다(다크에서 둘 다 파랑이라 두께만으로는 구분이 약했다).
        secondary:
          'border-border text-foreground hover:bg-secondary-hover aria-pressed:border-primary aria-pressed:ring-primary aria-pressed:focus-visible:ring-ring aria-pressed:focus-visible:ring-offset-background bg-transparent aria-pressed:ring-1 aria-pressed:focus-visible:ring-2 aria-pressed:focus-visible:ring-offset-2',
        clear: 'text-foreground hover:bg-secondary-hover bg-transparent',
      },
      size: {
        small:
          'h-8 gap-1.5 px-3 text-sm leading-4 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*="size-"])]:size-4',
        medium:
          'h-10 gap-1.5 px-4 text-sm leading-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*="size-"])]:size-4',
        large:
          'h-12 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*="size-"])]:size-5',
        xlarge:
          'h-14 gap-2 px-6 has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5 [&_svg:not([class*="size-"])]:size-6',
      },
      display: {
        inline: 'inline-flex',
        block: 'flex w-full',
        full: 'flex w-full grow',
      },
      radius: {
        md: 'rounded-md',
        lg: 'rounded-lg',
        pill: 'rounded-pill',
      },
      icon: {
        false: '',
        true: 'shrink-0 p-0',
      },
    },
    compoundVariants: [
      { size: 'small', icon: true, class: 'size-8' },
      { size: 'medium', icon: true, class: 'size-10' },
      { size: 'large', icon: true, class: 'size-12' },
      { size: 'xlarge', icon: true, class: 'size-14' },
    ],
    defaultVariants: {
      variant: 'secondary',
      size: 'large',
      display: 'inline',
      radius: 'lg',
      icon: false,
    },
  },
);

/** 터치로 누른 뒤 아이콘이 재생될 동안 올려 둔 상태를 유지하는 시간(ms). 가장 긴 아이콘 동작보다 길다. */
const TOUCH_HOVER_HOLD = 1200;

const BUTTON_PRESS = {
  rest: { scale: 1 },
  pressed: { scale: 0.96 },
};

const ICON_PRESS = {
  rest: { scale: 1 },
  pressed: { scale: 0.9 },
};

const SOLID_DIMMER = {
  rest: { opacity: 0 },
  pressed: { opacity: 0.26 },
};

const GHOST_DIMMER = {
  rest: { opacity: 0 },
  pressed: { opacity: 0.08 },
};

const PRESS_SPRING = SPRING.snappy;

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export type ButtonProps = {
  asChild?: boolean;
  loading?: boolean;
} & ButtonVariantProps &
  Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'onAnimationStart' | 'onAnimationEnd' | 'onDrag' | 'onDragStart' | 'onDragEnd'
  >;

function flattenButtonChildren(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) => {
    if (isValidElement(child) && child.type === Fragment) {
      return flattenButtonChildren((child.props as { children?: ReactNode }).children);
    }

    if (typeof child === 'string' || typeof child === 'number') {
      return String(child).trim() ? [child] : [];
    }

    return [child];
  });
}

function withIconHover(children: ReactNode, hovered: boolean): ReactNode {
  return flattenButtonChildren(children).map((child) => {
    if (!isValidElement(child) || typeof child.type === 'string') {
      return child;
    }

    return cloneElement(child as ReactElement<{ isHovered?: boolean }>, {
      isHovered: hovered,
    });
  });
}

function ButtonLoader() {
  return (
    <span className="absolute inset-0 z-10 flex items-center justify-center gap-1" aria-hidden>
      <span className="animate-button-loader-dot size-1.5 rounded-full bg-current" />
      <span className="animate-button-loader-dot size-1.5 rounded-full bg-current [animation-delay:0.15s]" />
      <span className="animate-button-loader-dot size-1.5 rounded-full bg-current [animation-delay:0.3s]" />
    </span>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    asChild = false,
    children,
    className,
    disabled,
    display,
    icon = false,
    loading = false,
    onBlur,
    onClick,
    onFocus,
    onPointerEnter,
    onPointerLeave,
    radius,
    size,
    type = 'button',
    variant,
    ...props
  },
  ref,
) {
  const shouldReduceMotion = useReducedMotion();
  const [focusVisible, setFocusVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (releaseTimer.current) clearTimeout(releaseTimer.current);
    },
    [],
  );
  const classes = cn(
    buttonVariants({
      variant,
      size,
      display: icon ? 'inline' : display,
      radius,
      icon,
    }),
    className,
  );
  const canPress = !disabled && !loading;
  const isSolidPress = variant === 'primary';
  const pressVariants = shouldReduceMotion
    ? { rest: { scale: 1 }, pressed: { scale: 1 } }
    : icon
      ? ICON_PRESS
      : BUTTON_PRESS;

  // 키보드로 포커스가 왔을 때도 아이콘이 마우스를 올린 것과 같이 움직인다(마우스로 누른 포커스는 해당하지 않는다).
  function handleFocus(event: FocusEvent<HTMLButtonElement>) {
    onFocus?.(event);
    if (event.currentTarget.matches(':focus-visible')) setFocusVisible(true);
  }

  function handleBlur(event: FocusEvent<HTMLButtonElement>) {
    onBlur?.(event);
    setFocusVisible(false);
  }

  function handlePointerEnter(event: PointerEvent<HTMLButtonElement>) {
    onPointerEnter?.(event);
    if (releaseTimer.current) clearTimeout(releaseTimer.current);
    setHovered(true);
  }

  function handlePointerLeave(event: PointerEvent<HTMLButtonElement>) {
    onPointerLeave?.(event);
    if (event.pointerType === 'mouse') {
      setHovered(false);
      return;
    }
    // 터치와 펜은 누르는 순간 올림과 뗌(pointerenter, pointerleave)이 거의 동시에 와서, 바로 풀면 아이콘이 움직일 틈이
    // 없다. 손가락을 뗀 뒤에도 아이콘이 한 번 재생될 시간만큼 올려 둔 상태로 둔다.
    if (releaseTimer.current) clearTimeout(releaseTimer.current);
    releaseTimer.current = setTimeout(() => {
      setHovered(false);
    }, TOUCH_HOVER_HOLD);
  }

  if (asChild) {
    return (
      <Slot className={classes} ref={ref} onBlur={onBlur} onFocus={onFocus} {...props}>
        {children}
      </Slot>
    );
  }

  return (
    <motion.button
      ref={ref}
      aria-busy={loading || undefined}
      className={cn(classes, loading && 'pointer-events-none')}
      disabled={disabled}
      type={type}
      variants={pressVariants}
      initial="rest"
      animate="rest"
      whileTap={canPress ? 'pressed' : undefined}
      transition={PRESS_SPRING}
      {...props}
      onBlur={handleBlur}
      onClick={loading ? undefined : onClick}
      onFocus={handleFocus}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <span
        className={
          loading ? 'invisible inline-flex items-center justify-center gap-[inherit]' : 'contents'
        }
      >
        {withIconHover(children, hovered || focusVisible)}
      </span>
      {canPress ? (
        <motion.span
          aria-hidden
          className={
            isSolidPress
              ? 'bg-dimmer pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]'
              : 'bg-foreground pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]'
          }
          variants={isSolidPress ? SOLID_DIMMER : GHOST_DIMMER}
        />
      ) : null}
      {loading ? <ButtonLoader /> : null}
    </motion.button>
  );
});
