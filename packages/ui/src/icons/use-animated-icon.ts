import { useAnimation } from 'motion/react';
import { type MouseEvent, useCallback, useEffect } from 'react';

export function useAnimatedIcon(
  isHovered: boolean | undefined,
  onMouseEnter?: (event: MouseEvent<HTMLSpanElement>) => void,
  onMouseLeave?: (event: MouseEvent<HTMLSpanElement>) => void,
) {
  const controls = useAnimation();
  const parentControlled = isHovered !== undefined;

  useEffect(() => {
    if (!parentControlled) {
      return;
    }

    void controls.start(isHovered ? 'animate' : 'normal');
  }, [controls, isHovered, parentControlled]);

  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLSpanElement>) => {
      onMouseEnter?.(event);

      if (parentControlled) {
        return;
      }

      void controls.start('animate');
    },
    [controls, onMouseEnter, parentControlled],
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

  return { controls, handleMouseEnter, handleMouseLeave };
}
