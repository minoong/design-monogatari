// lucide-animated(MIT, Copyright pqoqubbw)의 chevron-down 아이콘을 scripts/adapt-lucide-animated.mjs로 옮겼다.
'use client';

import { motion, type Transition } from 'motion/react';
import { forwardRef, type HTMLAttributes, useImperativeHandle } from 'react';

import { IconFrame } from './icon-frame';
import { useAnimatedIcon } from './use-animated-icon';

export type ChevronDownIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type ChevronDownIconProps = {
  isHovered?: boolean;
  size?: number;
} & HTMLAttributes<HTMLSpanElement>;

const DEFAULT_TRANSITION: Transition = {
  times: [0, 0.4, 1],
  duration: 0.5,
};

export const ChevronDownIcon = forwardRef<ChevronDownIconHandle, ChevronDownIconProps>(
  function ChevronDownIcon(
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
        <svg
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
          <motion.path
            animate={controls}
            d="m6 9 6 6 6-6"
            transition={DEFAULT_TRANSITION}
            variants={{
              normal: { y: 0 },
              animate: { y: [0, 2, 0] },
            }}
          />
        </svg>
      </IconFrame>
    );
  },
);
