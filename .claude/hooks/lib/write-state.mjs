import { renameSync, writeFileSync } from 'node:fs';

/**
 * 상태 파일을 임시 파일에 쓴 뒤 이름을 바꿔 저장한다. 훅이 병렬로 돌아도(여러 도구 호출, 서브에이전트) 반쯤 쓰인 JSON을 다른 훅이
 * 읽지 않는다. 직접 `writeFileSync`로 덮어쓰면 읽는 쪽이 잘린 JSON을 받아 상태를 비운 것으로 처리했고, 그러면 완료 게이트가 풀렸다.
 */
export function writeStateAtomically(path, text) {
  const temp = `${path}.${process.pid}.tmp`;
  writeFileSync(temp, text);
  renameSync(temp, path);
}
