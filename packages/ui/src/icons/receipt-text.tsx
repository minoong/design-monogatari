// lucide-animated(MIT, Copyright pqoqubbw)의 receipt-text 아이콘을 scripts/adapt-lucide-animated.mjs로 옮겼다.
'use client';

import { motion, type Variants } from 'motion/react';
import { forwardRef, type HTMLAttributes, useImperativeHandle } from 'react';

import { IconFrame } from './icon-frame';
import { useAnimatedIcon } from './use-animated-icon';

export type ReceiptTextIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type ReceiptTextIconProps = {
  isHovered?: boolean;
  size?: number;
} & HTMLAttributes<HTMLSpanElement>;

// 업스트림은 hidden/visible 변형을 순서대로 재생하는데 우리 훅은 normal/animate만 쓴다. 영수증 줄이 차례로 다시 그려지는 같은 움직임을
// normal(그려진 상태)/animate(줄마다 지연을 둔 다시 그리기)로 옮겼다.
const LINE_VARIANTS: Variants = {
  normal: { pathLength: 1, opacity: 1 },
  animate: (index: number) => ({
    pathLength: [0, 1],
    opacity: 1,
    transition: { duration: 0.35, ease: 'linear', delay: index * 0.1 },
  }),
};

export const ReceiptTextIcon = forwardRef<ReceiptTextIconHandle, ReceiptTextIconProps>(
  function ReceiptTextIcon(
    { onMouseEnter, onMouseLeave, className, isHovered, size = 24, ...props },
    ref,
  ) {
    const { controls, handleMouseEnter, handleMouseLeave, play, stop } = useAnimatedIcon(
      isHovered,
      onMouseEnter,
      onMouseLeave,
    );

    useImperativeHandle(ref, () => ({
      startAnimation: play,
      stopAnimation: stop,
    }));

    return (
      <IconFrame
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        <motion.svg
          focusable="false"
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z" />
          <g>
            <motion.path
              animate={controls}
              custom={0}
              d="M8 8H14"
              initial="normal"
              variants={LINE_VARIANTS}
            />
            <motion.path
              animate={controls}
              custom={1}
              d="M8 12H16"
              initial="normal"
              variants={LINE_VARIANTS}
            />
            <motion.path
              animate={controls}
              custom={2}
              d="M8 16H13"
              initial="normal"
              variants={LINE_VARIANTS}
            />
          </g>
        </motion.svg>
      </IconFrame>
    );
  },
);
