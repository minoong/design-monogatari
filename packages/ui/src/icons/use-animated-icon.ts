import { useAnimation, useReducedMotion } from 'motion/react';
import { type MouseEvent, useCallback, useEffect } from 'react';

export function useAnimatedIcon(
  isHovered: boolean | undefined,
  onMouseEnter?: (event: MouseEvent<HTMLSpanElement>) => void,
  onMouseLeave?: (event: MouseEvent<HTMLSpanElement>) => void,
) {
  const controls = useAnimation();
  // 감소 모션이면 아이콘은 움직이지 않는다(업스트림 아이콘에는 이 처리가 없다). 마우스를 올렸다 뗄 때마다 읽는다.
  const reducedMotion = useReducedMotion();
  const parentControlled = isHovered !== undefined;

  useEffect(() => {
    if (!parentControlled) {
      return;
    }

    void controls.start(isHovered && !reducedMotion ? 'animate' : 'normal');
  }, [controls, isHovered, parentControlled, reducedMotion]);

  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      onMouseEnter?.(event);

      if (parentControlled) {
        return;
      }

      if (!reducedMotion) void controls.start('animate');
    },
    [controls, onMouseEnter, parentControlled, reducedMotion],
  );

  const handleMouseLeave = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      onMouseLeave?.(event);

      if (parentControlled) {
        return;
      }

      void controls.start('normal');
    },
    [controls, onMouseLeave, parentControlled],
  );

  // 손으로 재생하는 쪽(`startAnimation`, 마운트 때 한 번 재생 등)도 감소 모션을 따른다.
  const play = useCallback(() => {
    if (!reducedMotion) void controls.start('animate');
  }, [controls, reducedMotion]);
  const stop = useCallback(() => {
    void controls.start('normal');
  }, [controls]);

  return { controls, handleMouseEnter, handleMouseLeave, play, stop };
}
