#!/usr/bin/env node
/**
 * sessionStart — inject DESIGN.md and auto UI verify (no user prompt).
 * @see https://cursor.com/docs/agent/hooks
 */

import { existsSync } from 'node:fs';
import { stdin } from 'node:process';

async function readStdin() {
  const chunks = [];
  for await (const chunk of stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

await readStdin();

const additional_context = existsSync('DESIGN.md')
  ? [
      'Visual source of truth: DESIGN.md at the repo root.',
      'CSS tokens: packages/ui/src/styles/globals.css.',
      'Project rule: .cursor/rules/design.mdc.',
      'Before UI work, read DESIGN.md. Do not hardcode hex in components.',
      'Storybook must set html.light or html.dark so preview canvas matches tokens.',
      'Do not wait for the user to ask: after UI, token, or Storybook changes, verify with Playwright MCP (`.cursor/mcp.json` playwright, often namespace `user-playwright`) in light and dark, check border/ring/press, then `.agents/skills/ship-ui-change/SKILL.md` (`pnpm verify`). A stop hook will auto-continue if you try to finish without that.',
    ].join(' ')
  : 'DESIGN.md is missing. Recreate it (Apple-inspired, Geist) and sync packages/ui/src/styles/globals.css.';

process.stdout.write(JSON.stringify({ additional_context }));
