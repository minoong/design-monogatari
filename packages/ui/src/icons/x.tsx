// lucide-animated(MIT, Copyright pqoqubbw)의 x 아이콘을 scripts/adapt-lucide-animated.mjs로 옮겼다.
'use client';

import { motion, type Variants } from 'motion/react';
import { forwardRef, type HTMLAttributes, useImperativeHandle } from 'react';

import { IconFrame } from './icon-frame';
import { useAnimatedIcon } from './use-animated-icon';

export type XIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type XIconProps = {
  isHovered?: boolean;
  size?: number;
  /** 선 굵기. 기본 2. 작은 크기에서 더 굵게 쓰려고 업스트림에 없는 것을 더했다. */
  strokeWidth?: number;
} & HTMLAttributes<HTMLSpanElement>;

const PATH_VARIANTS: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
  },
};

export const XIcon = forwardRef<XIconHandle, XIconProps>(function XIcon(
  { onMouseEnter, onMouseLeave, className, isHovered, size = 24, strokeWidth = 2, ...props },
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
        strokeWidth={strokeWidth}
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path animate={controls} d="M18 6 6 18" variants={PATH_VARIANTS} />
        <motion.path
          animate={controls}
          d="m6 6 12 12"
          transition={{ delay: 0.2 }}
          variants={PATH_VARIANTS}
        />
      </svg>
    </IconFrame>
  );
});
