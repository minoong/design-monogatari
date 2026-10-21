#!/usr/bin/env node
/**
 * PostToolUse — @repo/ui 컴포넌트를 고친 직후, 그 컴포넌트에 빠진 것(스토리, 문서 페이지, 예시,
 * 레지스트리 항목, DESIGN.md)을 바로 알려 준다. 끝나는 시점(Stop)이 아니라 작업 중에 피드백을 주려는 것이다.
 * 판단은 scripts/check-components.mjs 가 한다. 이 훅은 결과를 additionalContext 로 전달만 하고
 * 작업을 막지 않는다(막는 것은 pnpm verify 안의 같은 검사다).
 *
 * 같은 누락 목록은 한 번만 알린다(상태 파일에 서명을 저장).
 */

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env, stdin } from 'node:process';

import { logEvent, repoRelative } from './lib/log.mjs';
import { writeStateAtomically } from './lib/write-state.mjs';

const ROOT = env.CLAUDE_PROJECT_DIR || process.cwd();
const STATE_PATH = join(ROOT, '.claude/hooks/state/component-check.json');
const EDIT_TOOLS = new Set(['Write', 'Edit', 'MultiEdit']);

const COMPONENT_PATH =
  /(?:^|\/)(?:packages\/ui\/src\/([a-z0-9-]+)(?:\.stories)?\.tsx|apps\/docs\/content\/docs\/components\/([a-z0-9-]+)\.mdx|apps\/docs\/src\/_examples\/([a-z0-9-]+)\/[a-z0-9-]+\.tsx)$/;

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

if (!EDIT_TOOLS.has(input.tool_name)) {
  process.exit(0);
}

const filePath = String(input.tool_input?.file_path || '').replaceAll('\\', '/');
const match = COMPONENT_PATH.exec(filePath);
const name = match?.[1] || match?.[2] || match?.[3];
if (!name) {
  process.exit(0);
}

let result;
try {
  result = JSON.parse(
    execFileSync(
      'node',
      [join(ROOT, 'scripts/check-components.mjs'), '--component', name, '--json'],
      {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        timeout: 10_000,
      },
    ),
  );
} catch (error) {
  // 검사가 실패(종료 코드 1)하면 stdout 에 JSON 이 있다
  try {
    result = JSON.parse(error.stdout);
  } catch {
    process.exit(0);
  }
}

if (result.ok) {
  process.exit(0);
}

const signature = createHash('sha256')
  .update(
    `${name}:${result.problems.map((problem) => `${problem.rule}:${problem.message}`).join('|')}`,
  )
  .digest('hex')
  .slice(0, 16);

let state = {};
try {
  state = existsSync(STATE_PATH) ? JSON.parse(readFileSync(STATE_PATH, 'utf8')) : {};
} catch {
  state = {};
}
if (state[name] === signature) {
  process.exit(0);
}
state[name] = signature;
try {
  mkdirSync(join(ROOT, '.claude/hooks/state'), { recursive: true });
  writeStateAtomically(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`);
} catch {
  // 상태 저장 실패는 알림에 영향을 주지 않는다
}

logEvent(input, {
  tool: input.tool_name,
  file: repoRelative(filePath, ROOT),
  decision: 'nudge',
  reason: 'component_incomplete',
});

const lines = result.problems.map(
  (problem) => `- (${problem.rule}) ${problem.message} → ${problem.fix}`,
);
process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: `components:check found ${result.problems.length} missing item(s) for the ${name} component:\n${lines.join('\n')}\npnpm verify runs the same check, so these must be done before the work is finished.`,
    },
  }),
);
