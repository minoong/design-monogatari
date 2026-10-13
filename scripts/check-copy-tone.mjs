#!/usr/bin/env node
/**
 * 화면과 문서에 보이는 한국어 문구가 합쇼체(-습니다, -십시오)인지, 자동차 소개·견적 맥락인지 검사한다.
 *
 *   node scripts/check-copy-tone.mjs
 *
 * 왜 필요한가: 스토리와 문서 예시는 복사해 쓰는 견본이라 한번 해요체나 은행 예시가 들어가면 계속 번진다.
 * 규칙은 .claude/rules/copy-tone.md 에 있고, 이 스크립트가 `pnpm verify`에서 어긴 줄을 알려 준다.
 * 코드 주석(한다체)과 개발자용 문서(AGENTS.md 등)는 검사하지 않는다.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const SCOPE =
  /^(packages\/ui\/(src|\.storybook)|apps\/docs\/(content|src)|apps\/web\/src)\/.*\.(tsx?|mdx?|mjs)$/;

// 해요체 종결. "주요", "필요"처럼 명사에 붙은 요는 걸리지 않는다.
const HAEYO =
  /[가-힣]+(?:어요|아요|해요|돼요|예요|이에요|니에요|세요|까요|게요|네요|죠)(?![가-힣])/g;
// 이 디자인 시스템의 견본은 자동차 소개·견적이다. 은행 예시는 쓰지 않는다.
const BANKING = /이체|송금|입금|출금|계좌|잔액|받는 분|보내는 분/g;

const files = execFileSync('git', ['ls-files', '-co', '--exclude-standard'], {
  cwd: ROOT,
  encoding: 'utf8',
})
  .split('\n')
  .filter((file) => SCOPE.test(file));

const problems = [];
for (const file of files) {
  readFileSync(join(ROOT, file), 'utf8')
    .split('\n')
    .forEach((line, index) => {
      // 코드 주석은 개발자용이라 건너뛴다.
      if (/^\s*(\/\/|\/\*|\*)/.test(line)) return;
      const tone = line.match(HAEYO);
      if (tone) problems.push(`${file}:${index + 1}  해요체 → 합쇼체: ${tone.join(', ')}`);
      const bank = line.match(BANKING);
      if (bank)
        problems.push(`${file}:${index + 1}  은행 예시 → 자동차 견적 문구: ${bank.join(', ')}`);
    });
}

if (problems.length > 0) {
  console.error('copy-tone: 문구 규칙을 어긴 줄이 있습니다 (.claude/rules/copy-tone.md).\n');
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`copy-tone: ${files.length}개 파일 검사, 위반 없음`);
