#!/usr/bin/env node
/**
 * SessionStart — inject DESIGN.md pointers and the auto UI verify loop.
 * @see https://code.claude.com/docs/ko/hooks
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { env, stdin } from 'node:process';

import { logEvent } from './lib/log.mjs';

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
  // 입력이 없거나 JSON이 아니어도 컨텍스트 주입은 계속한다
}

const root = env.CLAUDE_PROJECT_DIR || process.cwd();

const additionalContext = existsSync(join(root, 'DESIGN.md'))
  ? [
      // 하네스 지침(묻지 말 것, 브랜치, 검증 루프)은 .claude/rules/agent-loop.md 와 git-workflow.md 에 있다. 여기서는 중복하지 않는다
      'Visual source of truth: DESIGN.md. CSS tokens: packages/ui/src/styles/globals.css. Rule: .claude/rules/design.md.',
      'Before UI work, read DESIGN.md. Do not hardcode hex in components.',
    ].join(' ')
  : 'DESIGN.md is missing. Recreate it (Apple-inspired, Geist) and sync packages/ui/src/styles/globals.css.';

const source = String(input.source || 'start')
  .toLowerCase()
  .replace(/[^a-z]/g, '');
logEvent(input, {
  decision: 'allow',
  reason: existsSync(join(root, 'DESIGN.md')) ? `session_${source}` : 'design_md_missing',
});

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext },
  }),
);
