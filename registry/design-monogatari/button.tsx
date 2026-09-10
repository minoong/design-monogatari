'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, useReducedMotion } from 'motion/react';
import {
  type ButtonHTMLAttributes,
  Children,
  cloneElement,
  forwardRef,
  Fragment,
  isValidElement,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

export const buttonVariants = cva(
  'focus-visible:ring-ring relative box-border cursor-pointer appearance-none items-center justify-center border border-transparent font-sans text-base leading-5 font-medium whitespace-nowrap outline-none select-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-40 **:data-icon:inline-flex **:data-icon:shrink-0 **:data-icon:items-center **:data-icon:justify-center [&_svg]:pointer-events-none [&_svg]:block [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:ring-offset-background focus-visible:ring-offset-2',
        secondary: 'border-border text-foreground hover:bg-secondary-hover bg-transparent',
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

const PRESS_SPRING = { type: 'spring' as const, stiffness: 520, damping: 32 };

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
    onClick,
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
  const [hovered, setHovered] = useState(false);
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

  function handlePointerEnter(event: PointerEvent<HTMLButtonElement>) {
    onPointerEnter?.(event);
    setHovered(true);
  }

  function handlePointerLeave(event: PointerEvent<HTMLButtonElement>) {
    onPointerLeave?.(event);
    setHovered(false);
  }

  if (asChild) {
    return (
      <Slot className={classes} ref={ref} {...props}>
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
      onClick={loading ? undefined : onClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <span
        className={
          loading ? 'invisible inline-flex items-center justify-center gap-[inherit]' : 'contents'
        }
      >
        {withIconHover(children, hovered)}
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
