import { type RefObject, useEffect, useRef, useState } from 'react';

/** 방금 선택됐는지(`in`), 방금 해제됐는지(`out`), 아직 바뀐 적 없는지(`undefined`). */
export type CheckPhase = 'in' | 'out' | undefined;

/**
 * 체크 상태가 **바뀐 순간**을 알려 준다. 처음 그려질 때는 `undefined`라서, 처음부터 선택된 항목이
 * 화면이 열릴 때 움직이지 않는다.
 *
 * - 제어 컴포넌트(`checked`를 넘김): 값이 바뀐 렌더에서 바로 계산한다.
 * - 비제어: 문서의 `change` 이벤트를 듣고 입력의 `checked`가 바뀌었는지 비교한다. 라디오는 새로 선택되는
 *   쪽에서만 이벤트가 발생하지만 이벤트가 문서까지 올라오므로, 같은 묶음에서 선택이 풀린 쪽도 알 수 있다.
 */
export function useCheckPhase(
  checked: boolean | undefined,
  inputRef: RefObject<HTMLInputElement | null>,
): CheckPhase {
  const [phase, setPhase] = useState<CheckPhase>(undefined);
  const [previous, setPrevious] = useState(checked);
  const last = useRef<boolean | undefined>(undefined);

  if (checked !== undefined && checked !== previous) {
    setPrevious(checked);
    setPhase(checked ? 'in' : 'out');
  }

  useEffect(() => {
    const input = inputRef.current;
    if (checked !== undefined || !input) return;
    last.current = input.checked;
    const onChange = () => {
      if (input.checked === last.current) return;
      last.current = input.checked;
      setPhase(input.checked ? 'in' : 'out');
    };
    const doc = input.ownerDocument;
    doc.addEventListener('change', onChange);
    return () => doc.removeEventListener('change', onChange);
  }, [checked, inputRef]);

  return phase;
}
