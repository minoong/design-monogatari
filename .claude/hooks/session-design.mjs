#!/usr/bin/env node
/**
 * SessionStart — inject DESIGN.md pointers and the auto UI verify loop.
 * @see https://code.claude.com/docs/ko/hooks
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { env, stdin } from 'node:process';

async function readStdin() {
  const chunks = [];
  for await (const chunk of stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

await readStdin();

const root = env.CLAUDE_PROJECT_DIR || process.cwd();

const additionalContext = existsSync(join(root, 'DESIGN.md'))
  ? [
      'Harness: do not ask to continue, verify, or commit. Infer from the request and the repo.',
      'Default git branch is main (not master). Create a feat/fix/chore branch before code changes.',
      'Visual source of truth: DESIGN.md. CSS tokens: packages/ui/src/styles/globals.css. Rule: .claude/rules/design.md.',
      'Before UI work, read DESIGN.md. Do not hardcode hex in components.',
      'Storybook must set html.light or html.dark so preview canvas matches tokens.',
      'After UI, token, or Storybook changes: delegate to the ui-verifier subagent (.claude/agents/ui-verifier.md; Playwright MCP in light and dark), then pnpm verify. Skill: ship-ui-change.',
      'PostToolUse / SubagentStop / Stop hooks block finishing if verify is skipped. Merge notice → checkout main and pull.',
    ].join(' ')
  : 'DESIGN.md is missing. Recreate it (Apple-inspired, Geist) and sync packages/ui/src/styles/globals.css.';

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext },
  }),
);
