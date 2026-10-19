// lucide-animated(MIT, Copyright pqoqubbw)의 rotate-ccw 아이콘을 scripts/adapt-lucide-animated.mjs로 옮겼다.
'use client';

import { motion } from 'motion/react';
import { forwardRef, type HTMLAttributes, useImperativeHandle } from 'react';

import { IconFrame } from './icon-frame';
import { useAnimatedIcon } from './use-animated-icon';

export type RotateCCWIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type RotateCCWIconProps = {
  isHovered?: boolean;
  size?: number;
} & HTMLAttributes<HTMLSpanElement>;

export const RotateCCWIcon = forwardRef<RotateCCWIconHandle, RotateCCWIconProps>(
  function RotateCCWIcon(
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
          animate={controls}
          fill="none"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          transition={{ type: 'spring', stiffness: 250, damping: 25 }}
          variants={{
            normal: { rotate: '0deg' },
            animate: { rotate: '-50deg' },
          }}
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </motion.svg>
      </IconFrame>
    );
  },
);
