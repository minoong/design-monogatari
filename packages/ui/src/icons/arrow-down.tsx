// lucide-animated(MIT, Copyright pqoqubbw)의 arrow-down 아이콘을 scripts/adapt-lucide-animated.mjs로 옮겼다.
'use client';

import { motion, type Variants } from 'motion/react';
import { forwardRef, type HTMLAttributes, useImperativeHandle } from 'react';

import { IconFrame } from './icon-frame';
import { useAnimatedIcon } from './use-animated-icon';

export type ArrowDownIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type ArrowDownIconProps = {
  isHovered?: boolean;
  size?: number;
} & HTMLAttributes<HTMLSpanElement>;

const PATH_VARIANTS: Variants = {
  normal: { d: 'm19 12-7 7-7-7', translateY: 0 },
  animate: {
    d: 'm19 12-7 7-7-7',
    translateY: [0, -3, 0],
    transition: {
      duration: 0.4,
    },
  },
};

const SECOND_PATH_VARIANTS: Variants = {
  normal: { d: 'M12 5v14' },
  animate: {
    d: ['M12 5v14', 'M12 5v9', 'M12 5v14'],
    transition: {
      duration: 0.4,
    },
  },
};

export const ArrowDownIcon = forwardRef<ArrowDownIconHandle, ArrowDownIconProps>(
  function ArrowDownIcon(
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
          <motion.path animate={controls} d="m19 12-7 7-7-7" variants={PATH_VARIANTS} />
          <motion.path animate={controls} d="M12 5v14" variants={SECOND_PATH_VARIANTS} />
        </svg>
      </IconFrame>
    );
  },
);
