'use client';

import { motion } from 'motion/react';
import { forwardRef, type HTMLAttributes, useImperativeHandle } from 'react';

import { IconFrame } from './icon-frame';
import { useAnimatedIcon } from './use-animated-icon';

export type PlusIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type PlusIconProps = {
  isHovered?: boolean;
  size?: number;
} & HTMLAttributes<HTMLSpanElement>;

export const PlusIcon = forwardRef<PlusIconHandle, PlusIconProps>(function PlusIcon(
  { onMouseEnter, onMouseLeave, className, isHovered, size = 24, ...props },
  ref,
) {
  const { controls, handleMouseEnter, handleMouseLeave } = useAnimatedIcon(
    isHovered,
    onMouseEnter,
    onMouseLeave,
  );

  useImperativeHandle(ref, () => ({
    startAnimation: () => void controls.start('animate'),
    stopAnimation: () => void controls.start('normal'),
  }));

  return (
    <IconFrame
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <motion.svg
        animate={controls}
        fill="none"
        focusable="false"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        variants={{
          normal: { rotate: 0 },
          animate: { rotate: 180 },
        }}
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </motion.svg>
    </IconFrame>
  );
});
