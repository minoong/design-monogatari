/**
 * 하네스 훅 이벤트 로그.
 *
 * 훅이 이벤트마다 한 줄(JSONL)을 `.claude/logs/hook-events.jsonl`(gitignore)에 남긴다.
 * 목적은 "루프가 실제로 동작했다"는 증거를 쌓는 것이다: 어떤 UI 편집이 표시됐고, 언제 종료가
 * 차단됐고, 어떤 검증이 끝나서 통과했는지.
 *
 * 개인정보를 남기지 않기 위해 **허용 목록 방식**으로만 기록한다.
 *   - 프롬프트, 명령어 본문, 도구 출력, 트랜스크립트 경로는 받지도 저장하지도 않는다
 *   - 파일 경로는 프로젝트 기준 상대 경로만 (밖이면 버린다)
 *   - 세션 id는 SHA-256 앞 10자리로만 남긴다
 *   - 모든 값은 정규식으로 검증하고, 맞지 않으면 그 필드만 버린다
 *
 * 로깅 실패는 절대 훅의 판단(Stop 차단 여부)에 영향을 주면 안 되므로 모든 예외를 삼킨다.
 */

import { createHash } from 'node:crypto';
import { appendFileSync, mkdirSync, renameSync, statSync } from 'node:fs';
import { isAbsolute, join, relative } from 'node:path';
import process from 'node:process';

const PROJECT_DIR = process.env.CLAUDE_PROJECT_DIR || process.cwd();
export const LOG_PATH = join(PROJECT_DIR, '.claude/logs/hook-events.jsonl');
const MAX_BYTES = 1024 * 1024;

export const DECISIONS = new Set(['mark', 'nudge', 'block', 'allow', 'skip']);
const IDENT = /^[A-Za-z0-9_.:-]{1,80}$/;
const REASON = /^[a-z0-9_]{1,48}$/;
const SESSION = /^[0-9a-f]{10}$/;

export function hashSession(id) {
  if (!id) {
    return 'unknown000';
  }
  return createHash('sha256').update(String(id)).digest('hex').slice(0, 10);
}

/** 프로젝트 안의 파일만 상대 경로로 돌려준다. 밖이거나 이상하면 undefined. */
export function repoRelative(file, projectDir = PROJECT_DIR) {
  if (typeof file !== 'string' || file === '') {
    return undefined;
  }
  const rel = isAbsolute(file) ? relative(projectDir, file) : file;
  if (!rel || rel.startsWith('..') || isAbsolute(rel) || rel.includes('\0')) {
    return undefined;
  }
  return rel.replaceAll('\\', '/').slice(0, 200);
}

function pick(value, pattern) {
  return typeof value === 'string' && pattern.test(value) ? value : undefined;
}

/** 로그 한 줄의 유일한 통로. 여기를 통과하지 못하는 값은 기록되지 않는다. */
export function sanitizeEntry(raw) {
  const entry = {
    ts: typeof raw.ts === 'string' && !Number.isNaN(Date.parse(raw.ts)) ? raw.ts : undefined,
    event: pick(raw.event, /^[A-Za-z]{1,32}$/),
    session: pick(raw.session, SESSION),
    agent: pick(raw.agent, IDENT),
    tool: pick(raw.tool, IDENT),
    file: pick(raw.file, /^[^\0]{1,200}$/),
    decision: DECISIONS.has(raw.decision) ? raw.decision : undefined,
    reason: pick(raw.reason, REASON),
    dirty: typeof raw.dirty === 'boolean' ? raw.dirty : undefined,
    playwright: typeof raw.playwright === 'boolean' ? raw.playwright : undefined,
    verify: typeof raw.verify === 'boolean' ? raw.verify : undefined,
  };
  // 상대 경로 규칙을 한 번 더 강제한다 (절대 경로, 상위 경로, 홈 디렉터리 표기 거부)
  if (
    entry.file &&
    (isAbsolute(entry.file) || entry.file.startsWith('..') || entry.file.startsWith('~'))
  ) {
    entry.file = undefined;
  }
  return Object.fromEntries(Object.entries(entry).filter(([, value]) => value !== undefined));
}

function rotateIfLarge() {
  try {
    if (statSync(LOG_PATH).size > MAX_BYTES) {
      renameSync(LOG_PATH, LOG_PATH.replace(/\.jsonl$/, '.1.jsonl'));
    }
  } catch {
    // 파일이 아직 없으면 회전할 것도 없다
  }
}

/**
 * @param {object} input 훅이 받은 JSON (세션 id, 이벤트 이름, 에이전트 유형만 읽는다)
 * @param {object} fields 이 이벤트에 대해 기록할 값 (tool, file, decision, reason, dirty, playwright, verify)
 */
export function logEvent(input, fields = {}) {
  try {
    const entry = sanitizeEntry({
      ts: new Date().toISOString(),
      event: input?.hook_event_name,
      session: hashSession(input?.session_id),
      agent: input?.agent_type,
      ...fields,
    });
    if (!entry.decision || !entry.reason) {
      return;
    }
    mkdirSync(join(PROJECT_DIR, '.claude/logs'), { recursive: true });
    rotateIfLarge();
    appendFileSync(LOG_PATH, `${JSON.stringify(entry)}\n`);
  } catch {
    // 로깅은 최선 노력이다. 훅의 동작을 바꾸지 않는다.
  }
}
