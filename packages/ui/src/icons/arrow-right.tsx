'use client';

import { motion, type Variants } from 'motion/react';
import { forwardRef, type HTMLAttributes, useImperativeHandle } from 'react';

import { IconFrame } from './icon-frame';
import { useAnimatedIcon } from './use-animated-icon';

export type ArrowRightIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type ArrowRightIconProps = {
  isHovered?: boolean;
  size?: number;
} & HTMLAttributes<HTMLSpanElement>;

const PATH_VARIANTS: Variants = {
  normal: { d: 'M5 12h14' },
  animate: {
    d: ['M5 12h14', 'M5 12h9', 'M5 12h14'],
    transition: { duration: 0.4 },
  },
};

const SECONDARY_PATH_VARIANTS: Variants = {
  normal: { d: 'm12 5 7 7-7 7', translateX: 0 },
  animate: {
    d: 'm12 5 7 7-7 7',
    translateX: [0, -3, 0],
    transition: { duration: 0.4 },
  },
};

export const ArrowRightIcon = forwardRef<ArrowRightIconHandle, ArrowRightIconProps>(
  function ArrowRightIcon(
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
        <svg
          fill="none"
          focusable="false"
          height={size}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width={size}
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path animate={controls} d="M5 12h14" variants={PATH_VARIANTS} />
          <motion.path animate={controls} d="m12 5 7 7-7 7" variants={SECONDARY_PATH_VARIANTS} />
        </svg>
      </IconFrame>
    );
  },
);
