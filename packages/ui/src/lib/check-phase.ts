import { type RefObject, useEffect, useState } from 'react';

/** 방금 선택됐는지(`in`), 방금 해제됐는지(`out`), 아직 바뀐 적 없는지(`undefined`). */
export type CheckPhase = 'in' | 'out' | undefined;

/**
 * 체크 상태가 **바뀐 순간**을 알려 준다. 처음 그려질 때는 `undefined`라서, 처음부터 선택된 항목이
 * 화면이 열릴 때 움직이지 않는다.
 *
 * - 제어 컴포넌트(`checked`를 넘김): 값이 바뀐 렌더에서 바로 계산한다. 라디오 묶음에서 선택이 다른 행으로
 *   옮겨 가면 이전 행은 `out`이 된다.
 * - 비제어: 입력의 `change` 이벤트로 알아낸다. 라디오는 선택되는 쪽에서만 이벤트가 오므로 해제되는 쪽의
 *   `out`은 알 수 없다. 해제 모션이 필요한 라디오는 제어 컴포넌트로 쓰십시오.
 */
export function useCheckPhase(
  checked: boolean | undefined,
  inputRef: RefObject<HTMLInputElement | null>,
): CheckPhase {
  const [phase, setPhase] = useState<CheckPhase>(undefined);
  const [previous, setPrevious] = useState(checked);

  if (checked !== undefined && checked !== previous) {
    setPrevious(checked);
    setPhase(checked ? 'in' : 'out');
  }

  useEffect(() => {
    const input = inputRef.current;
    if (checked !== undefined || !input) return;
    const onChange = () => setPhase(input.checked ? 'in' : 'out');
    input.addEventListener('change', onChange);
    return () => input.removeEventListener('change', onChange);
  }, [checked, inputRef]);

  return phase;
}
