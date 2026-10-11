#!/usr/bin/env node
/**
 * 훅 이벤트 로그에서 공개 가능한 트레이스를 뽑는다.
 *
 *   node .claude/hooks/export-trace.mjs                 # 전체 세션 요약
 *   node .claude/hooks/export-trace.mjs --story         # "차단 → 통과" 세션만
 *   node .claude/hooks/export-trace.mjs --session <id>  # 한 세션 (해시 앞부분 일치)
 *   node .claude/hooks/export-trace.mjs --last          # 가장 최근 세션
 *   node .claude/hooks/export-trace.mjs --out trace.json
 *
 * 원본 로그는 gitignore 대상이고, 이 스크립트의 출력만 사람이 골라 커밋한다.
 * 출력 직전에 절대 경로, 이메일, 홈 디렉터리 같은 흔적이 있으면 아무것도 쓰지 않고 실패한다.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

import { LOG_PATH, sanitizeEntry } from './lib/log.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const value = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

// 출력에 있어서는 안 되는 흔적. 하나라도 보이면 내보내기를 거부한다.
const PRIVACY_PATTERNS = [
  [/\/Users\/|\/home\/|\/private\/|\/var\/folders\//, '절대 경로'],
  [/[A-Za-z]:\\/, 'Windows 경로'],
  [/[\w.+-]+@[\w-]+\.[\w.-]+/, '이메일'],
  [/claude-\d+|\.claude\/projects/, '세션 저장 경로'],
  [/~\//, '홈 디렉터리 표기'],
];

function fail(message) {
  process.stderr.write(`export-trace: ${message}\n`);
  process.exit(2);
}

function readEntries() {
  const paths = [LOG_PATH.replace(/\.jsonl$/, '.1.jsonl'), LOG_PATH].filter((path) =>
    existsSync(path),
  );
  if (paths.length === 0) {
    fail(`로그가 없습니다 (${LOG_PATH}). 훅이 한 번도 기록하지 않았습니다.`);
  }
  const entries = [];
  for (const path of paths) {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      if (!line.trim()) {
        continue;
      }
      try {
        // 읽을 때도 한 번 더 허용 목록을 통과시킨다
        const entry = sanitizeEntry(JSON.parse(line));
        if (entry.ts && entry.session && entry.decision && entry.reason) {
          entries.push(entry);
        }
      } catch {
        // 깨진 줄은 건너뛴다
      }
    }
  }
  return entries.sort((a, b) => a.ts.localeCompare(b.ts));
}

function groupBySession(entries) {
  const sessions = new Map();
  for (const entry of entries) {
    if (!sessions.has(entry.session)) {
      sessions.set(entry.session, []);
    }
    sessions.get(entry.session).push(entry);
  }
  return sessions;
}

/** 차단 이후에 완료 조건이 충족된 세션인가 */
function blockThenPass(events) {
  const firstBlock = events.findIndex((event) => event.decision === 'block');
  return (
    firstBlock >= 0 && events.slice(firstBlock).some((event) => event.reason === 'dod_satisfied')
  );
}

function summarize(session, events) {
  const start = Date.parse(events[0].ts);
  const tally = {};
  for (const event of events) {
    const key = `${event.decision}:${event.reason}`;
    tally[key] = (tally[key] ?? 0) + 1;
  }
  return {
    session,
    started: events[0].ts,
    durationSec: Math.round((Date.parse(events.at(-1).ts) - start) / 1000),
    story: blockThenPass(events) ? 'block_then_pass' : undefined,
    counts: tally,
    // 절대 시각 대신 시작 기준 경과 시간을 쓴다
    events: events.map(({ ts, ...rest }) => ({
      t: Math.round((Date.parse(ts) - start) / 1000),
      ...rest,
    })),
  };
}

let sessions = groupBySession(readEntries());

if (value('--session')) {
  const prefix = value('--session');
  sessions = new Map([...sessions].filter(([id]) => id.startsWith(prefix)));
}
if (flag('--last')) {
  const last = [...sessions].sort((a, b) => b[1].at(-1).ts.localeCompare(a[1].at(-1).ts))[0];
  sessions = new Map(last ? [last] : []);
}
if (flag('--story')) {
  sessions = new Map([...sessions].filter(([, events]) => blockThenPass(events)));
}
if (sessions.size === 0) {
  fail('조건에 맞는 세션이 없습니다.');
}

const output = JSON.stringify(
  { sessions: [...sessions].map(([id, events]) => summarize(id, events)) },
  null,
  2,
);

for (const [pattern, label] of PRIVACY_PATTERNS) {
  if (pattern.test(output)) {
    fail(`출력에 ${label} 흔적이 있어 내보내기를 거부합니다.`);
  }
}

if (value('--out')) {
  writeFileSync(value('--out'), `${output}\n`);
  process.stdout.write(`export-trace: ${sessions.size}개 세션을 ${value('--out')}에 썼습니다\n`);
} else {
  process.stdout.write(`${output}\n`);
}
