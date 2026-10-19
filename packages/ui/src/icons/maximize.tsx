// lucide-animated(MIT, Copyright pqoqubbw)의 maximize 아이콘을 scripts/adapt-lucide-animated.mjs로 옮겼다.
'use client';

import { motion, type Transition } from 'motion/react';
import { forwardRef, type HTMLAttributes, useImperativeHandle } from 'react';

import { IconFrame } from './icon-frame';
import { useAnimatedIcon } from './use-animated-icon';

export type MaximizeIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type MaximizeIconProps = {
  isHovered?: boolean;
  size?: number;
} & HTMLAttributes<HTMLSpanElement>;

const DEFAULT_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 250,
  damping: 25,
};

export const MaximizeIcon = forwardRef<MaximizeIconHandle, MaximizeIconProps>(function MaximizeIcon(
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
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          animate={controls}
          d="M8 3H5a2 2 0 0 0-2 2v3"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { translateX: '0%', translateY: '0%' },
            animate: { translateX: '-2px', translateY: '-2px' },
          }}
        />

        <motion.path
          animate={controls}
          d="M21 8V5a2 2 0 0 0-2-2h-3"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { translateX: '0%', translateY: '0%' },
            animate: { translateX: '2px', translateY: '-2px' },
          }}
        />

        <motion.path
          animate={controls}
          d="M3 16v3a2 2 0 0 0 2 2h3"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { translateX: '0%', translateY: '0%' },
            animate: { translateX: '-2px', translateY: '2px' },
          }}
        />

        <motion.path
          animate={controls}
          d="M16 21h3a2 2 0 0 0 2-2v-3"
          transition={DEFAULT_TRANSITION}
          variants={{
            normal: { translateX: '0%', translateY: '0%' },
            animate: { translateX: '2px', translateY: '2px' },
          }}
        />
      </svg>
    </IconFrame>
  );
});
