#!/usr/bin/env node
/**
 * InstructionsLoaded — 어떤 CLAUDE.md / .claude/rules 파일이 언제, 왜 컨텍스트에 올라왔는지 기록한다.
 * 관찰 전용이다(이 이벤트는 차단할 수 없다). 메모리·경로 한정 규칙이 실제로 동작한다는 증거로 쓴다.
 *
 * 기록은 lib/log.mjs 의 허용 목록을 거친다: 프로젝트 안의 상대 경로만 남고, 사용자 홈의 파일은
 * 경로가 버려진다. load_reason 은 session_start | nested_traversal | path_glob_match | include | compact.
 */

import { env, stdin } from 'node:process';

import { logEvent, repoRelative } from './lib/log.mjs';

async function readStdin() {
  const chunks = [];
  for await (const chunk of stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

let input = {};
try {
  input = JSON.parse(await readStdin());
} catch {
  process.exit(0);
}

const reason = String(input.load_reason || 'unknown')
  .toLowerCase()
  .replace(/[^a-z0-9_]/g, '');

logEvent(input, {
  file: repoRelative(input.file_path, env.CLAUDE_PROJECT_DIR || process.cwd()),
  decision: 'allow',
  reason: `instr_${reason}`.slice(0, 48),
});
