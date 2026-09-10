#!/usr/bin/env node
/**
 * Auto UI definition-of-done: mark visual edits, then on stop continue
 * the agent until Playwright (light/dark) and `pnpm verify` have run.
 * @see https://cursor.com/docs/agent/hooks
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { stdin } from 'node:process';

const STATE_DIR = join(process.cwd(), '.cursor/hooks/state');
const event = process.argv[2] ?? '';

const UI_ROOT = /(?:^|\/)(?:packages\/ui\/|apps\/(?:web|docs)\/|registry\/)/;
const UI_FILE = /(?:^|\/)(?:DESIGN\.md|registry\.json)$/;
const UI_EXT = /\.(?:tsx|css)$/;
const SKIP_DOC = /(?:\/AGENTS\.md$|\.mdc$|\/SKILL\.md$)/;

async function readStdin() {
  const chunks = [];
  for await (const chunk of stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function parseInput(raw) {
  if (!raw.trim()) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

const STATE_PATH = join(STATE_DIR, 'ui-verify.json');

function loadState() {
  if (!existsSync(STATE_PATH)) {
    return { dirty: false, files: [], playwright: false, verify: false };
  }
  try {
    return {
      dirty: false,
      files: [],
      playwright: false,
      verify: false,
      ...JSON.parse(readFileSync(STATE_PATH, 'utf8')),
    };
  } catch {
    return { dirty: false, files: [], playwright: false, verify: false };
  }
}

function saveState(state) {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(
    STATE_PATH,
    `${JSON.stringify({ ...state, updatedAt: new Date().toISOString() }, null, 2)}\n`,
  );
}

function toPosix(filePath) {
  return String(filePath || '').replaceAll('\\', '/');
}

function isVisualUiPath(filePath) {
  const posix = toPosix(filePath);
  if (!posix) {
    return false;
  }
  if (
    posix.includes('/.cursor/') ||
    posix.includes('/node_modules/') ||
    posix.includes('/.git/') ||
    posix.includes('/.agents/')
  ) {
    return false;
  }
  if (SKIP_DOC.test(posix)) {
    return false;
  }
  if (UI_FILE.test(posix)) {
    return true;
  }
  return UI_ROOT.test(posix) && UI_EXT.test(posix);
}

function verifySucceeded(command, output) {
  const cmd = String(command || '');
  if (!/\bpnpm(?:\s+\S+)*\s+verify\b/.test(cmd)) {
    return false;
  }
  const text = String(output || '');
  if (/Command failed|ELIFECYCLE|ERROR\s+run failed|Failed:\s*[1-9]/i.test(text)) {
    return false;
  }
  return true;
}

function isPlaywrightMcp(input) {
  const server = String(input.mcp_server_name || '');
  const tool = String(input.tool_name || '');
  return /playwright/i.test(server) || /playwright/i.test(tool);
}

function isFresh(state) {
  if (!state.dirty) {
    return false;
  }
  if (!state.updatedAt) {
    return true;
  }
  const at = Date.parse(state.updatedAt);
  return Number.isFinite(at) && Date.now() - at < 2 * 60 * 60 * 1000;
}

function followupMessage(state) {
  const files = (state.files || []).slice(-8).join(', ') || 'UI files';
  const missing = [];
  if (!state.playwright) {
    missing.push(
      'Playwright MCP (`playwright` in `.cursor/mcp.json`, namespace often `user-playwright`): Storybook http://localhost:6006 in html.light and html.dark. Interact (press/hover/focus). Check border-border and ring-ring. Start Storybook if it is down.',
    );
  }
  if (!state.verify) {
    missing.push('`pnpm verify`');
  }
  return [
    `UI changed (${files}) but definition of done is incomplete. Do not ask the user. Do not commit.`,
    `Still needed: ${missing.join(' then ')}.`,
    'Then report pass/fail and stop. Skill: `.agents/skills/ship-ui-change/SKILL.md`.',
  ].join(' ');
}

function writeJson(payload) {
  process.stdout.write(JSON.stringify(payload));
}

try {
  const input = parseInput(await readStdin());

  if (event === 'afterFileEdit') {
    if (isVisualUiPath(input.file_path)) {
      const state = loadState();
      const posix = toPosix(input.file_path);
      const files = [...new Set([...(state.files || []), posix])].slice(-20);
      saveState({ dirty: true, files, playwright: false, verify: false });
    }
    writeJson({});
    process.exit(0);
  }

  if (event === 'afterShellExecution') {
    if (verifySucceeded(input.command, input.output)) {
      const state = loadState();
      if (state.dirty) {
        saveState({ ...state, verify: true });
      }
    }
    writeJson({});
    process.exit(0);
  }

  if (event === 'afterMCPExecution') {
    if (isPlaywrightMcp(input)) {
      const state = loadState();
      if (state.dirty) {
        saveState({ ...state, playwright: true });
      }
    }
    writeJson({});
    process.exit(0);
  }

  if (event === 'stop') {
    if (input.status !== 'completed') {
      writeJson({});
      process.exit(0);
    }
    const state = loadState();
    if (!isFresh(state)) {
      if (state.dirty) {
        saveState({ dirty: false, files: [], playwright: false, verify: false });
      }
      writeJson({});
      process.exit(0);
    }
    const loopCount = Number(input.loop_count || 0);
    const needsWork = !state.playwright || !state.verify;
    if (needsWork && loopCount < 2) {
      writeJson({ followup_message: followupMessage(state) });
      process.exit(0);
    }
    if (state.dirty && state.playwright && state.verify) {
      saveState({ dirty: false, files: [], playwright: false, verify: false });
    }
    writeJson({});
    process.exit(0);
  }

  writeJson({});
} catch {
  writeJson({});
}
