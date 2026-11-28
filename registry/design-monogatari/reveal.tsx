'use client';

import { type HTMLMotionProps, motion, useReducedMotion } from 'motion/react';
import { createContext, useContext } from 'react';

import { DURATION, EASE, reducedTransition, STAGGER } from '@/lib/motion';

const RevealGroupContext = createContext(false);

// amount 비율은 화면보다 5배 넘게 큰 요소에서는 영원히 채워지지 않는다. 한 픽셀이라도 들어오면 시작한다.
const VIEWPORT = { once: true, amount: 'some', margin: '0px 0px -10% 0px' } as const;

export type RevealGroupProps = HTMLMotionProps<'div'> & {
  /** 항목 사이 지연(초). 기본 0.04 */
  stagger?: number;
};

/**
 * 안에 있는 `Reveal`들이 화면에 들어올 때 차례로 나타나게 한다. 한 번만 재생한다.
 * 첫 화면 위쪽에 있는 내용에는 쓰지 않는다: 자바스크립트가 실행되기 전까지 숨겨져 있다.
 */
export function RevealGroup({ stagger = STAGGER.base, ...props }: RevealGroupProps) {
  const reduce = useReducedMotion();

  return (
    <RevealGroupContext.Provider value>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: reduce ? 0 : stagger } },
        }}
        {...props}
      />
    </RevealGroupContext.Provider>
  );
}

export type RevealProps = HTMLMotionProps<'div'> & {
  /** 아래에서 올라오는 거리(px). 감소 모션에서는 움직임 없이 바로 나타난다. */
  distance?: number;
};

/** 화면에 들어올 때 아래에서 위로 떠오르며 나타난다. `RevealGroup` 안에서는 그룹의 순서를 따른다. */
export function Reveal({ distance = 12, ...props }: RevealProps) {
  const reduce = useReducedMotion();
  const inGroup = useContext(RevealGroupContext);
  // 서버 렌더에는 감소 모션 설정이 없어서(`null`) 숨은 모습의 위치를 설정에 따라 바꾸면 hydration이 어긋난다. 위치는 늘 같게 두고,
  // 감소 모션에서는 전환 시간을 없애(`reducedTransition`) 움직임이 보이지 않게 한다.
  const variants = {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: reducedTransition(reduce, { duration: DURATION.slow, ease: EASE.outExpo }),
    },
  };

  return inGroup ? (
    <motion.div variants={variants} {...props} />
  ) : (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={VIEWPORT}
      variants={variants}
      {...props}
    />
  );
}
