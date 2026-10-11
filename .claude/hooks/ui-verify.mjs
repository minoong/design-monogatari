#!/usr/bin/env node
/**
 * Auto UI definition-of-done: mark visual edits (PostToolUse), then block
 * Stop / SubagentStop until Playwright (light/dark) and `pnpm verify` have run.
 * One script for all events — dispatches on `hook_event_name`.
 * @see https://code.claude.com/docs/ko/hooks
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { env, stdin } from 'node:process';

import { logEvent, repoRelative } from './lib/log.mjs';

const STATE_DIR = join(env.CLAUDE_PROJECT_DIR || process.cwd(), '.claude/hooks/state');
const STATE_PATH = join(STATE_DIR, 'ui-verify.json');

const UI_ROOT = /(?:^|\/)(?:packages\/ui\/|apps\/(?:web|docs)\/|registry\/)/;
const UI_FILE = /(?:^|\/)(?:DESIGN\.md|registry\.json)$/;
const UI_EXT = /\.(?:tsx|css)$/;
const SKIP_DOC = /(?:\/(?:AGENTS|CLAUDE)\.md$|\.md$|\/SKILL\.md$)/;
const EDIT_TOOLS = new Set(['Write', 'Edit', 'MultiEdit', 'NotebookEdit']);

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

function emptyState() {
  return { dirty: false, files: [], agents: [], playwright: false, verify: false, nudged: false };
}

function loadState() {
  if (!existsSync(STATE_PATH)) {
    return emptyState();
  }
  try {
    return { ...emptyState(), ...JSON.parse(readFileSync(STATE_PATH, 'utf8')) };
  } catch {
    return emptyState();
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
    posix.includes('/.claude/') ||
    posix.includes('/node_modules/') ||
    posix.includes('/.git/') ||
    posix.includes('/.agents/')
  ) {
    return false;
  }
  if (SKIP_DOC.test(posix) && !UI_FILE.test(posix)) {
    return false;
  }
  if (UI_FILE.test(posix)) {
    return true;
  }
  return UI_ROOT.test(posix) && UI_EXT.test(posix);
}

function isVerifyCommand(command) {
  return /\bpnpm(?:\s+\S+)*\s+verify\b/.test(String(command || ''));
}

function verifySucceeded(command, response) {
  if (!isVerifyCommand(command)) {
    return false;
  }
  if (response && typeof response === 'object' && response.interrupted) {
    return false;
  }
  const text =
    typeof response === 'string'
      ? response
      : `${response?.stdout ?? ''}\n${response?.stderr ?? ''}`;
  return !/Command failed|ELIFECYCLE|ERROR\s+run failed|Failed:\s*[1-9]/i.test(text);
}

function editedPaths(toolInput) {
  const obj = toolInput && typeof toolInput === 'object' ? toolInput : {};
  return [obj.file_path, obj.notebook_path].filter(Boolean).map(toPosix);
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
      'Playwright MCP via the `ui-verifier` subagent: Storybook http://localhost:6006 in html.light and html.dark. Interact (press/hover/focus). Check border-border and ring-ring. Start Storybook if it is down.',
    );
  }
  if (!state.verify) {
    missing.push('`pnpm verify`');
  }
  return [
    `UI changed (${files}) but definition of done is incomplete. Do not ask the user. Do not commit.`,
    `Still needed: ${missing.join(' then ')}.`,
    'Then report pass/fail and stop. Subagent: `.claude/agents/ui-verifier.md`. Skill: `ship-ui-change`.',
  ].join(' ');
}

function writeJson(payload) {
  process.stdout.write(JSON.stringify(payload));
}

function postToolUseContext(additionalContext) {
  return { hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext } };
}

function handlePostToolUse(input) {
  const tool = String(input.tool_name || '');

  if (EDIT_TOOLS.has(tool)) {
    const uiPaths = editedPaths(input.tool_input).filter(isVisualUiPath);
    if (uiPaths.length === 0) {
      return {};
    }
    const state = loadState();
    const next = {
      dirty: true,
      files: [...new Set([...(state.files || []), ...uiPaths])].slice(-20),
      agents: [...new Set([...(state.agents || []), ...(input.agent_id ? [input.agent_id] : [])])],
      playwright: false,
      verify: false,
      nudged: Boolean(state.nudged),
    };
    const snapshot = {
      tool,
      file: repoRelative(uiPaths[0]),
      dirty: true,
      playwright: false,
      verify: false,
    };
    if (!next.nudged) {
      next.nudged = true;
      saveState(next);
      logEvent(input, { ...snapshot, decision: 'nudge', reason: 'ui_edit_first' });
      return postToolUseContext(
        'UI file edited. Do not ask the user. Before finishing: delegate to the ui-verifier subagent (Playwright Storybook html.light and html.dark), then pnpm verify. Do not commit unless asked.',
      );
    }
    saveState(next);
    logEvent(input, { ...snapshot, decision: 'mark', reason: 'ui_edit' });
    return {};
  }

  if (tool === 'Bash') {
    const state = loadState();
    const command = input.tool_input?.command;
    if (state.dirty && isVerifyCommand(command)) {
      const passed = verifySucceeded(command, input.tool_response);
      if (passed) {
        saveState({ ...state, verify: true });
      }
      logEvent(input, {
        tool,
        decision: passed ? 'mark' : 'skip',
        reason: passed ? 'verify_passed' : 'verify_failed',
        dirty: true,
        playwright: state.playwright,
        verify: passed || state.verify,
      });
    }
    return {};
  }

  if (/^mcp__playwright__/.test(tool)) {
    const state = loadState();
    if (state.dirty) {
      saveState({ ...state, playwright: true });
      logEvent(input, {
        tool,
        decision: 'mark',
        reason: 'playwright_used',
        dirty: true,
        playwright: true,
        verify: state.verify,
      });
    }
  }
  return {};
}

function handleStop(input) {
  const state = loadState();
  const snapshot = { dirty: state.dirty, playwright: state.playwright, verify: state.verify };
  // Already continuing because of this hook: let it finish instead of looping.
  if (input.stop_hook_active) {
    if (state.dirty) {
      logEvent(input, { ...snapshot, decision: 'allow', reason: 'reentry_guard' });
    }
    return {};
  }
  // A subagent is only held back if it edited UI itself.
  if (input.hook_event_name === 'SubagentStop' && !(state.agents || []).includes(input.agent_id)) {
    if (state.dirty) {
      logEvent(input, { ...snapshot, decision: 'allow', reason: 'subagent_not_editor' });
    }
    return {};
  }
  if (!isFresh(state)) {
    if (state.dirty) {
      saveState(emptyState());
      logEvent(input, { ...snapshot, decision: 'allow', reason: 'stale_state_reset' });
    }
    return {};
  }
  if (!state.playwright || !state.verify) {
    const missing =
      !state.playwright && !state.verify ? 'both' : state.playwright ? 'verify' : 'playwright';
    logEvent(input, { ...snapshot, decision: 'block', reason: `missing_${missing}` });
    return { decision: 'block', reason: followupMessage(state) };
  }
  saveState(emptyState());
  logEvent(input, { ...snapshot, decision: 'allow', reason: 'dod_satisfied' });
  return {};
}

try {
  const input = parseInput(await readStdin());
  const event = input.hook_event_name;

  if (event === 'PostToolUse') {
    writeJson(handlePostToolUse(input));
  } else if (event === 'Stop' || event === 'SubagentStop') {
    writeJson(handleStop(input));
  } else {
    writeJson({});
  }
} catch {
  writeJson({});
}
