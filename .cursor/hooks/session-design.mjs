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
      'Harness: do not ask to continue, verify, or commit. Infer from the request and the repo.',
      'Default git branch is main (not master). Create a feat/fix/chore branch before code changes.',
      'Visual source of truth: DESIGN.md. CSS tokens: packages/ui/src/styles/globals.css. Rule: .cursor/rules/design.mdc.',
      'Before UI work, read DESIGN.md. Do not hardcode hex in components.',
      'Storybook must set html.light or html.dark so preview canvas matches tokens.',
      'After UI, token, or Storybook changes: Playwright MCP (mcp.json playwright) in light and dark, then pnpm verify. Prefer subagent .cursor/agents/ui-verifier.md. Skill: .agents/skills/ship-ui-change/SKILL.md.',
      'Stop / postToolUse / subagentStop hooks continue the loop if verify is skipped. Merge notice → checkout main and pull.',
    ].join(' ')
  : 'DESIGN.md is missing. Recreate it (Apple-inspired, Geist) and sync packages/ui/src/styles/globals.css.';

process.stdout.write(JSON.stringify({ additional_context }));
