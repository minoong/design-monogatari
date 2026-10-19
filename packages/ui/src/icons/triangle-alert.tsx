// 이 저장소에서 직접 만든 아이콘(Lucide의 triangle-alert 모양). 업스트림 lucide-animated에는 없다.
'use client';

import { motion, type Variants } from 'motion/react';
import { forwardRef, type HTMLAttributes, useImperativeHandle } from 'react';

import { IconFrame } from './icon-frame';
import { useAnimatedIcon } from './use-animated-icon';

export type TriangleAlertIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type TriangleAlertIconProps = {
  isHovered?: boolean;
  size?: number;
} & HTMLAttributes<HTMLSpanElement>;

/** 삼각형이 흔들리고 느낌표가 한 번 깜빡인다(경고를 알리는 한 번짜리 움직임). */
const TRIANGLE_VARIANTS: Variants = {
  normal: { rotate: 0 },
  animate: { rotate: [0, -8, 8, -5, 5, 0], transition: { duration: 0.6, ease: 'easeInOut' } },
};

const MARK_VARIANTS: Variants = {
  normal: { opacity: 1 },
  animate: { opacity: [1, 0.2, 1], transition: { duration: 0.6 } },
};

export const TriangleAlertIcon = forwardRef<TriangleAlertIconHandle, TriangleAlertIconProps>(
  function TriangleAlertIcon(
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
          <motion.g
            animate={controls}
            style={{ originX: '50%', originY: '50%' }}
            variants={TRIANGLE_VARIANTS}
          >
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
            <motion.path animate={controls} d="M12 9v4" variants={MARK_VARIANTS} />
            <motion.path animate={controls} d="M12 17h.01" variants={MARK_VARIANTS} />
          </motion.g>
        </svg>
      </IconFrame>
    );
  },
);
