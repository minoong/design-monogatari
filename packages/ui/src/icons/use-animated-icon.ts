import { useAnimation, useReducedMotion } from 'motion/react';
import { type MouseEvent, useCallback, useEffect, useRef } from 'react';

export function useAnimatedIcon(
  isHovered: boolean | undefined,
  onMouseEnter?: (event: MouseEvent<HTMLSpanElement>) => void,
  onMouseLeave?: (event: MouseEvent<HTMLSpanElement>) => void,
) {
  const controls = useAnimation();
  // 감소 모션이면 아이콘은 움직이지 않는다(업스트림 아이콘에는 이 처리가 없다). 마우스를 올렸다 뗄 때마다 읽는다.
  const reducedMotion = useReducedMotion();
  const parentControlled = isHovered !== undefined;
  // 재생 중인 동작의 끝을 알려 주는 약속. 터치에서는 누르는 순간 올림과 뗌(pointerenter, pointerleave)이 거의 동시에
  // 와서, 뗌을 곧바로 처리하면 막 시작한 재생이 첫 프레임에서 끊긴다. 뗐을 때는 재생이 끝난 뒤에 원래 모양으로 돌린다.
  const running = useRef<Promise<unknown> | null>(null);
  // 새 재생이나 새 상태가 오면 올라간다. 끝나기를 기다리던 "원래 모양으로" 요청이 그 사이에 바뀐 상태를 덮어쓰지 않게 한다.
  const version = useRef(0);

  const start = useCallback(() => {
    version.current += 1;
    const promise = controls.start('animate');
    running.current = promise;
    const clear = () => {
      if (running.current === promise) running.current = null;
    };
    promise.then(clear, clear);
  }, [controls]);

  const settle = useCallback(() => {
    version.current += 1;
    const current = version.current;
    const pending = running.current;
    if (!pending) {
      void controls.start('normal');
      return;
    }
    void pending
      .catch(() => undefined)
      .then(() => {
        if (version.current === current) void controls.start('normal');
      });
  }, [controls]);

  useEffect(() => {
    if (!parentControlled) {
      return;
    }

    if (isHovered && !reducedMotion) start();
    else settle();
  }, [isHovered, parentControlled, reducedMotion, settle, start]);

  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      onMouseEnter?.(event);

      if (parentControlled) {
        return;
      }

      if (!reducedMotion) start();
    },
    [onMouseEnter, parentControlled, reducedMotion, start],
  );

  const handleMouseLeave = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      onMouseLeave?.(event);

      if (parentControlled) {
        return;
      }

      settle();
    },
    [onMouseLeave, parentControlled, settle],
  );

  // 손으로 재생하는 쪽(`startAnimation`, 마운트 때 한 번 재생 등)도 감소 모션을 따른다.
  const play = useCallback(() => {
    if (!reducedMotion) start();
  }, [reducedMotion, start]);
  const stop = useCallback(() => {
    version.current += 1;
    running.current = null;
    void controls.start('normal');
  }, [controls]);

  return { controls, handleMouseEnter, handleMouseLeave, play, stop };
}
