// 이 저장소에서 직접 만든 아이콘(Lucide의 printer 모양). 업스트림 lucide-animated에는 없다.
'use client';

import { motion, type Variants } from 'motion/react';
import { forwardRef, type HTMLAttributes, useImperativeHandle } from 'react';

import { IconFrame } from './icon-frame';
import { useAnimatedIcon } from './use-animated-icon';

export type PrinterIconHandle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type PrinterIconProps = {
  isHovered?: boolean;
  size?: number;
} & HTMLAttributes<HTMLSpanElement>;

/** 종이가 위로 나왔다가 아래 용지함으로 들어간다. */
const TOP_PAPER_VARIANTS: Variants = {
  normal: { y: 0 },
  animate: { y: [0, -1.5, 0], transition: { duration: 0.5, ease: 'easeInOut' } },
};

const TRAY_PAPER_VARIANTS: Variants = {
  normal: { y: 0 },
  animate: { y: [0, 2, 0], transition: { duration: 0.5, ease: 'easeInOut', delay: 0.1 } },
};

export const PrinterIcon = forwardRef<PrinterIconHandle, PrinterIconProps>(function PrinterIcon(
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
        <motion.path animate={controls} d="M6 9V2h12v7" variants={TOP_PAPER_VARIANTS} />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <motion.rect
          animate={controls}
          height="8"
          variants={TRAY_PAPER_VARIANTS}
          width="12"
          x="6"
          y="14"
        />
      </svg>
    </IconFrame>
  );
});
