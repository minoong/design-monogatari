'use client';

import {
  AnimatePresence,
  PresenceContext,
  useAnimate,
  useIsPresent,
  useReducedMotion,
} from 'motion/react';
import * as motion from 'motion/react-client';
import { type ReactNode, useContext, useLayoutEffect, useRef, useState } from 'react';

import { DURATION, EASE, SPRING } from '@/lib/motion';

export type PresenceFrom = 'left' | 'right' | 'up' | 'down';

/**
 * - `collapse`: 자리가 열리고 닫히며 컨트롤이 그 자리에서 드러난다(이웃도 함께 부드럽게 움직인다).
 * - `slide`: `collapse`에 더해 컨트롤이 `from` 쪽에서 밀려들고 그쪽으로 밀려난다. 자리 밖으로는 잘려서 이웃 위를 지나지 않는다.
 * - `spring`: `slide`와 같은 움직임을 시간 곡선 대신 스프링(`SPRING.settle`)으로 한다. 넘치지 않고 멈춘다.
 * - `reserve`: 자리는 늘 잡아 두고 컨트롤만 자기 자리 안에서 밀려들고 나간다. 이웃이 전혀 움직이지 않는다.
 */
export type PresenceVariant = 'collapse' | 'slide' | 'spring' | 'reserve';

export type PresenceProps = {
  /** 켜면 나타나고 끄면 사라진다. */
  show: boolean;
  /** 움직임의 모양. 기본은 `slide`. */
  variant?: PresenceVariant;
  /** 자리가 열리고 닫히는 축과 밀려드는 쪽. `left`·`right`는 가로, `up`·`down`은 세로. 기본은 `left`. */
  from?: PresenceFrom;
  /** 처음 그릴 때(`show`가 이미 켜져 있을 때)도 나타나는 움직임을 보일지. 기본은 가만히 있는다. */
  animateOnMount?: boolean;
  /** 자리를 차지하는 바깥 요소에 붙는다. */
  className?: string;
  children: ReactNode;
};

type Offset = { x?: string; y?: string };

function slideOffset(from: PresenceFrom): Offset {
  switch (from) {
    case 'left':
      return { x: '-100%' };
    case 'right':
      return { x: '100%' };
    case 'up':
      return { y: '-100%' };
    case 'down':
      return { y: '100%' };
  }
}

function transitionsFor(variant: PresenceVariant, reduceMotion: boolean | null) {
  if (reduceMotion) return { enter: { duration: 0 }, leave: { duration: 0 } };
  if (variant === 'spring') return { enter: SPRING.settle, leave: SPRING.settle };
  return {
    enter: { duration: DURATION.base, ease: EASE.outExpo },
    leave: { duration: DURATION.base, ease: EASE.inOut },
  };
}

function useTransitions(variant: PresenceVariant) {
  const reduceMotion = useReducedMotion();
  return { ...transitionsFor(variant, reduceMotion), reduceMotion };
}

type BoxProps = Pick<PresenceProps, 'from' | 'className' | 'children'> & {
  variant: Exclude<PresenceVariant, 'reserve'>;
};

// `AnimatePresence`의 직접 자식이어야 `useIsPresent`가 이 요소의 퇴장 상태를 알려 준다. 값만 읽는다: `usePresence`는 제거 신호(`safeToRemove`)를
// 직접 불러야 하는 훅이라 부르지 않으면 요소가 DOM에서 내려가지 않는다. 퇴장 애니메이션이 끝나면 안쪽 `motion.div`가 알아서 신호를 보낸다.
function PresenceBox({ variant, from = 'left', className, children }: BoxProps) {
  const isPresent = useIsPresent();
  // `AnimatePresence initial={false}`가 처음 그린 자식에게만 `initial: false`를 준다. 그 자식은 움직임 없이 열린 채로 시작한다.
  const startsOpen = useContext(PresenceContext)?.initial === false;
  const [settled, setSettled] = useState(startsOpen);
  // 사라지기 시작하거나 다시 돌아오는 순간 렌더링 중에 바로 "움직이는 중"으로 돌린다(연타해도 클립이 풀린 채 움직이는 프레임이 없게).
  const [wasPresent, setWasPresent] = useState(isPresent);
  if (isPresent !== wasPresent) {
    setWasPresent(isPresent);
    setSettled(false);
  }
  const { enter, leave, reduceMotion } = useTransitions(variant);
  const horizontal = from === 'left' || from === 'right';
  const closed = horizontal ? { width: 0 } : { height: 0 };
  const open = horizontal ? { width: 'auto' } : { height: 'auto' };
  const offset = variant !== 'collapse' && !reduceMotion ? slideOffset(from) : {};

  return (
    <motion.div
      className={className}
      // 움직이는 동안에는 자리 밖을 잘라 낸다(밀려드는 컨트롤이 이웃 위로 새지 않게). 다 열리면 풀어서 포커스 링이 잘리지 않게 한다.
      // `transitionEnd`는 새로 그린 요소에 적용되지 않아서 끝났는지를 상태로 들고 있는다.
      style={{ overflow: settled && isPresent ? 'visible' : 'clip' }}
      initial={closed}
      animate={open}
      exit={{ ...closed, transition: leave }}
      transition={enter}
      onAnimationStart={() => {
        setSettled(false);
      }}
      onAnimationComplete={() => {
        if (isPresent) setSettled(true);
      }}
      // 사라지는 동안에는 포커스와 클릭을 받지 않는다.
      inert={!isPresent}
    >
      <motion.div
        // 자리가 좁아져도 안의 글자가 접히지 않게 원래 폭을 지킨다.
        className={horizontal ? 'w-max' : undefined}
        initial={offset}
        animate={{ x: 0, y: 0 }}
        exit={{ ...offset, transition: leave }}
        transition={enter}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * 자리를 늘 잡아 두는 모양: 꺼져도 DOM에 남아 크기를 지키고, 컨트롤만 자기 자리 안에서 움직인다. 다 나간 뒤에는 보이지 않고(`visibility: hidden`) `inert`다.
 * 움직임이 끝났는지는 상태로 든다: 켜는 쪽으로 끝났으면 `shown`, 끄는 쪽으로 끝났으면 `hidden`. 목표와 다르면 아직 움직이는 중이다.
 * 끝났다는 신호를 선언형 `animate`의 `onAnimationComplete`로 받으면 나가는 움직임이 시작되자마자 날아와서 컨트롤이 바로 사라졌다. 그래서 움직임을
 * 직접 실행하고(`useAnimate`) 그 움직임이 스스로 끝날 때만 상태를 바꾼다. 도중에 `show`가 바뀌면 이전 움직임은 멈추고 완료로 치지 않는다.
 */
function ReservedPresence({
  show,
  from = 'left',
  animateOnMount,
  className,
  children,
}: Omit<PresenceProps, 'variant'>) {
  const reduceMotion = useReducedMotion();
  const [scope, animateEl] = useAnimate<HTMLDivElement>();
  // `show`가 바뀌는 순간 렌더링 중에 바로 "움직이는 중"으로 돌린다. 이전 목표와 비교하는 방식은 끄자마자 다시 켜면 같아져서 움직이는 도중에
  // 클립이 풀렸다. `animateOnMount`로 켜진 채 시작하면 들어오는 움직임이 끝날 때까지 움직이는 중으로 본다.
  const [prevShow, setPrevShow] = useState(show);
  const [resting, setResting] = useState(!(animateOnMount && show));
  if (show !== prevShow) {
    setPrevShow(show);
    setResting(false);
  }
  const firstRun = useRef(true);
  // 감소 모션이면 움직임이 없으므로 끝난 것으로 본다.
  const done = reduceMotion || resting;

  // 첫 그림이 최종 위치로 한 번 그려진 뒤 움직이지 않도록 그리기 전에 시작 위치를 정한다.
  useLayoutEffect(() => {
    const el = scope.current;
    if (!el) return;
    const hidden: Offset = reduceMotion ? {} : slideOffset(from);
    const { enter, leave } = transitionsFor('reserve', reduceMotion);
    const isFirst = firstRun.current;
    firstRun.current = false;

    if (isFirst && !(animateOnMount && show)) {
      // 처음부터 켜져 있으면 가만히 있고, 꺼져 있으면 나중에 밀려들 수 있게 나간 자리에 둔다.
      if (!show) void animateEl(el, hidden, { duration: 0 });
      return;
    }
    const keyframes =
      show && isFirst
        ? { x: [hidden.x ?? 0, 0], y: [hidden.y ?? 0, 0] }
        : show
          ? { x: 0, y: 0 }
          : hidden;
    // 도중에 `show`가 또 바뀌면 이 움직임은 멈추고, 늦게 도착하는 완료 신호는 무시한다.
    let cancelled = false;
    const controls = animateEl(el, keyframes, {
      ...(show ? enter : leave),
      onComplete: () => {
        if (!cancelled) setResting(true);
      },
    });
    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [show, from, reduceMotion, animateOnMount, scope, animateEl]);

  return (
    <div
      className={className}
      // 움직이는 동안에만 자리 밖을 잘라 내고, 멈춰 있을 때는 풀어서 포커스 링이 잘리지 않게 한다.
      style={{ overflow: done ? 'visible' : 'clip' }}
      inert={!show}
    >
      <div
        ref={scope}
        // 끄는 움직임이 끝나기 전에는 보이고, 끝난 뒤에 감춘다(자리는 그대로).
        style={{ visibility: done && !show ? 'hidden' : 'visible' }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * 조건에 따라 담기고 빠지는 컨트롤이 갑자기 끼어들고 사라지고, 그 순간 이웃이 확 밀리거나 당겨지지 않게 한다.
 * 자리가 열리고 닫히는 것이 기본이다(`collapse`, `slide`, `spring`): 이웃은 그 폭만큼 부드럽게 비켜 준다. `reserve`는 자리를 늘 잡아 두어
 * 이웃이 아예 움직이지 않는다. 투명도는 바꾸지 않아 반투명한 중간 상태가 없다. 감소 모션이면 움직임 없이 바로 바뀐다.
 *
 * 움직임이 없어도 되면 이 컴포넌트를 쓰지 않고 조건부로 그린다. 자리를 여닫는 모양은 폭이나 높이를 움직이는 예외다(`transform`/`opacity`만
 * 움직인다는 규칙의 예외이고, 아코디언의 높이와 같은 이유로 작은 컨트롤 하나에 한정한다). 처음부터 있던 것은 가만히 있고(`animateOnMount`로
 * 바꾼다), 사라지는 동안에는 `inert`라서 포커스와 클릭을 받지 않는다.
 */
export function Presence({
  show,
  variant = 'slide',
  from,
  animateOnMount = false,
  className,
  children,
}: PresenceProps) {
  if (variant === 'reserve') {
    return (
      <ReservedPresence
        show={show}
        from={from}
        animateOnMount={animateOnMount}
        className={className}
      >
        {children}
      </ReservedPresence>
    );
  }

  return (
    <AnimatePresence initial={animateOnMount}>
      {show ? (
        <PresenceBox key="presence" variant={variant} from={from} className={className}>
          {children}
        </PresenceBox>
      ) : null}
    </AnimatePresence>
  );
}
