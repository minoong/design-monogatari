#!/usr/bin/env node
/**
 * sessionStart — inject DESIGN.md as the visual source of truth.
 * @see https://cursor.com/docs/hooks
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
    ].join(' ')
  : 'DESIGN.md is missing. Recreate it (Apple-inspired, Geist) and sync packages/ui/src/styles/globals.css.';

process.stdout.write(JSON.stringify({ additional_context }));
