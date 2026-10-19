// lucide-animated(MIT, Copyright pqoqubbw)의 sun 아이콘을 scripts/adapt-lucide-animated.mjs로 옮겼다.
'use client';

import { motion, type Variants } from 'motion/react';
import { forwardRef, type HTMLAttributes, useImperativeHandle } from 'react';

import { IconFrame } from './icon-frame';
import { useAnimatedIcon } from './use-animated-icon';

export type SunIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type SunIconProps = {
  isHovered?: boolean;
  size?: number;
} & HTMLAttributes<HTMLSpanElement>;

const PATH_VARIANTS: Variants = {
  normal: { opacity: 1 },
  animate: (i: number) => ({
    opacity: [0, 1],
    transition: { delay: i * 0.1, duration: 0.3 },
  }),
};

export const SunIcon = forwardRef<SunIconHandle, SunIconProps>(function SunIcon(
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
        <circle cx="12" cy="12" r="4" />
        {[
          'M12 2v2',
          'm19.07 4.93-1.41 1.41',
          'M20 12h2',
          'm17.66 17.66 1.41 1.41',
          'M12 20v2',
          'm6.34 17.66-1.41 1.41',
          'M2 12h2',
          'm4.93 4.93 1.41 1.41',
        ].map((d, index) => (
          <motion.path
            animate={controls}
            custom={index + 1}
            d={d}
            key={d}
            variants={PATH_VARIANTS}
          />
        ))}
      </svg>
    </IconFrame>
  );
});
