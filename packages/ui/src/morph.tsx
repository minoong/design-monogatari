'use client';

import { AnimatePresence, useIsPresent, useReducedMotion } from 'motion/react';
import * as motion from 'motion/react-client';
import { type ReactNode, type Ref, useState } from 'react';

import { cn } from './lib/cn';
import { DURATION, EASE, SPRING } from './lib/motion';

export type MorphProps = {
  /** 지금 보이는 내용의 이름. 바뀌면 틀이 새 내용의 크기로 변형되고 내용이 밀려서 바뀐다. `null`이면 틀이 사라진다. */
  value: string | null;
  /**
   * 내용 이름을 순서대로 적는다. 뒤쪽 이름으로 바뀌면 새 내용이 오른쪽에서, 앞쪽 이름으로 바뀌면 왼쪽에서 밀려든다.
   * 적지 않으면 늘 오른쪽에서 밀려든다.
   */
  order?: readonly string[];
  /** 내용 이름별 모서리 반경(px). 틀이 변형되는 동안 모서리도 함께 바뀐다. 적지 않은 이름은 8이다. */
  radii?: Record<string, number>;
  /** 처음 그릴 때(`value`가 이미 있을 때)도 틀이 나타나는 움직임을 보일지. 기본은 가만히 있는다. */
  animateOnMount?: boolean;
  /** 틀에 붙는다. 배경, 테두리, 위치, 최대 폭을 여기서 준다. 틀은 안을 잘라 내므로(`overflow: clip`) 안의 포커스 링 여유는 내용이 둔다. */
  className?: string;
  /** 지금 `value`에 해당하는 내용. 내용이 바뀌는 쪽에서 `value`와 함께 바꿔 넘긴다. */
  children: ReactNode;
};

const DEFAULT_RADIUS = 8;

function directionOf(order: readonly string[] | undefined, from: string | null, to: string | null) {
  if (!order || from === null || to === null) return 1;
  return order.indexOf(to) >= order.indexOf(from) ? 1 : -1;
}

const slide = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (direction: number) => ({ x: direction > 0 ? '-100%' : '100%' }),
};

const noSlide = {
  enter: { x: 0 },
  center: { x: 0 },
  exit: { x: 0 },
};

// 직접 자식이 `popLayout`에서 위치를 잴 수 있게 `ref`를 `motion.div`로 넘긴다. 나가는 내용은 클릭과 포커스를 받지 않는다.
function Panel({
  ref,
  direction,
  reduceMotion,
  children,
}: {
  ref?: Ref<HTMLDivElement>;
  direction: number;
  reduceMotion: boolean | null;
  children: ReactNode;
}) {
  const isPresent = useIsPresent();
  return (
    <motion.div
      ref={ref}
      // 틀이 커지고 작아지는 동안 안의 내용이 늘어나 찌그러지지 않게 위치만 따라간다.
      layout="position"
      custom={direction}
      variants={reduceMotion ? noSlide : slide}
      initial="enter"
      animate="center"
      exit="exit"
      transition={reduceMotion ? { duration: 0 } : { duration: DURATION.base, ease: EASE.outExpo }}
      inert={!isPresent}
    >
      {children}
    </motion.div>
  );
}

function Frame({
  ref,
  value,
  direction,
  radius,
  className,
  children,
}: {
  ref?: Ref<HTMLDivElement>;
  value: string;
  direction: number;
  radius: number;
  className?: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const isPresent = useIsPresent();
  const spring = reduceMotion ? { duration: 0 } : SPRING.settle;

  return (
    <motion.div
      ref={ref}
      // 크기는 `layout`으로(변형), 모서리는 값으로 함께 바꾼다. 틀이 사라질 때는 왼쪽으로 밀려난다(자리 밖은 부모가 잘라 낸다).
      layout
      className={cn('relative overflow-clip', className)}
      initial={{ x: reduceMotion ? 0 : '-120%', borderRadius: radius }}
      animate={{ x: 0, borderRadius: radius }}
      exit={{
        x: reduceMotion ? 0 : '-120%',
        transition: { duration: reduceMotion ? 0 : DURATION.base, ease: EASE.inOut },
      }}
      transition={{
        layout: spring,
        borderRadius: spring,
        x: { duration: reduceMotion ? 0 : DURATION.base, ease: EASE.outExpo },
      }}
      inert={!isPresent}
    >
      {/* 나가는 내용은 흐름에서 빼서(`popLayout`) 틀이 새 내용의 크기로 바로 맞춰지고, 그 크기로 변형된다. */}
      <AnimatePresence mode="popLayout" custom={direction} initial={false}>
        <Panel key={value} direction={direction} reduceMotion={reduceMotion}>
          {children}
        </Panel>
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * 한 자리에서 서로 다른 내용으로 바뀌는 틀이다. 내용(`value`)이 바뀌면 틀이 새 내용의 크기와 모서리로 스프링을 따라 변형되고,
 * 안의 내용은 틀 안에서 옆으로 밀려 나가고 들어온다. 투명도는 바꾸지 않아 반투명한 중간 상태가 없다.
 *
 * 틀의 크기를 움직이는 예외다(`transform`/`opacity`만 움직인다는 규칙의 예외이고, Motion의 `layout`이 크기를 변환으로 바꿔 옮긴다).
 * 감소 모션이면 움직임 없이 바로 바뀐다. 틀은 `Presence`와 달리 자리를 열고 닫지 않으므로 주변에 자리를 내줄 필요가 없는 곳(절대 위치로 얹은 알약 등)에 쓴다.
 */
export function Morph({
  value,
  order,
  radii,
  animateOnMount = false,
  className,
  children,
}: MorphProps) {
  // 어느 쪽에서 밀려드는지는 바뀌는 순간 렌더링 중에 정한다(이전 이름과 새 이름의 순서를 비교).
  const [state, setState] = useState({ value, direction: 1 });
  if (value !== state.value) {
    setState({ value, direction: directionOf(order, state.value, value) });
  }

  return (
    <AnimatePresence initial={animateOnMount}>
      {value !== null ? (
        <Frame
          key="frame"
          className={className}
          direction={state.direction}
          radius={radii?.[value] ?? DEFAULT_RADIUS}
          value={value}
        >
          {children}
        </Frame>
      ) : null}
    </AnimatePresence>
  );
}
