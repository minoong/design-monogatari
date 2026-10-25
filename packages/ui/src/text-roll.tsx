'use client';

import { AnimatePresence, useReducedMotion, type Variants } from 'motion/react';
import * as motion from 'motion/react-client';
import { type ComponentProps } from 'react';

import { cn } from './lib/cn';
import { DURATION, EASE } from './lib/motion';

export type TextRollProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** 보여 줄 글자. 바뀌면 이전 글자가 밀려 나가고 새 글자가 바로 뒤따라 들어온다. */
  children: string;
  /**
   * 굴러가는 방향. `up`(기본)은 이전 글자가 위로 나가고 새 글자가 아래에서 올라오며, `down`은 반대다.
   * 다음 단계로 가면 `up`, 이전 단계로 돌아가면 `down`으로 하면 오가는 방향과 움직임이 맞는다.
   */
  direction?: 'up' | 'down';
};

const TRANSITION = { duration: DURATION.base, ease: EASE.outExpo };

/**
 * 서버는 감소 모션 설정을 몰라서 항상 이동 변형으로 처음 그리고, 클라이언트는 설정을 알고 그린다. 두 변형의 `in`(처음 그려지는 모습)이
 * 다르면 `style`이 서로 달라 hydration 오류가 나므로, 두 변형 모두 `in`을 `{ opacity: 1, y: 0 }`으로 같게 둔다. 차이는 바뀔 때의
 * `below`와 `out`에만 둔다.
 * `custom`은 방향(위 1, 아래 -1)이다. 나가는 글자는 AnimatePresence의 `custom`으로 바뀐 방향을 받는다.
 */
// 들어오는 글자와 나가는 글자가 같은 거리(한 덩어리의 높이)를 같은 시간과 곡선으로 움직여서, 새 글자가 이전 글자 바로 뒤에 붙는다.
const ROLL_VARIANTS: Variants = {
  below: (direction: number = 1) => ({ opacity: 1, y: `${direction * 100}%` }),
  in: { opacity: 1, y: 0, transition: TRANSITION },
  out: (direction: number = 1) => ({
    opacity: 1,
    y: `${direction * -100}%`,
    transition: TRANSITION,
  }),
};

/** 감소 모션: 이동 없이 짧게 바꾼다. */
const REDUCED_VARIANTS: Variants = {
  below: { opacity: 0, y: 0 },
  in: { opacity: 1, y: 0, transition: { duration: DURATION.instant } },
  out: { opacity: 0, y: 0, transition: { duration: DURATION.instant } },
};

/**
 * 글자가 바뀔 때 이전 글자가 한 덩어리로 밀려 나가고 새 글자가 바로 뒤에서 따라 들어옵니다. 단계 제목처럼 한 자리에서
 * 짧은 제목만 바뀌는 곳에 씁니다. 처음 그려질 때는 움직이지 않고, 감소 모션이면 이동 없이 바로 바뀝니다.
 * 읽어 주는 글자는 화면에 보이지 않는 한 벌(`sr-only`)이고 움직이는 글자는 `aria-hidden`이라 낭독기가 두 번 읽지 않습니다.
 */
export function TextRoll({ children, direction = 'up', className, ...props }: TextRollProps) {
  const reduce = useReducedMotion();
  const sign = direction === 'up' ? 1 : -1;

  return (
    <span
      className={cn(
        'relative my-[-0.1em] inline-grid overflow-hidden py-[0.1em] align-bottom',
        className,
      )}
      {...props}
    >
      <span className="sr-only">{children}</span>
      <AnimatePresence custom={sign} initial={false}>
        <motion.span
          key={children}
          aria-hidden
          className="col-start-1 row-start-1 select-none"
          custom={sign}
          initial="below"
          animate="in"
          exit="out"
          variants={reduce ? REDUCED_VARIANTS : ROLL_VARIANTS}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
