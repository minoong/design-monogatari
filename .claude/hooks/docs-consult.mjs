#!/usr/bin/env node
/**
 * 공식 문서를 먼저 확인하게 하는 훅 (PreToolUse 알림 + PostToolUse 기록).
 *
 * 문제: 규칙(animation.md, stack-guardrails.md, apps/web/AGENTS.md)은 "구현 전에 공식 문서나 스킬을 읽는다"고
 * 적고 있지만 글일 뿐이라 건너뛰기 쉬웠다. 이 훅은 라이브러리에 의존하는 파일을 고치기 직전, 이 세션에서
 * 해당 문서를 확인한 적이 없으면 한 번 알려 준다. 막지는 않는다(편집은 그대로 진행). 같은 주제는 세션당
 * 한 번만 알린다.
 *
 * "확인했다"의 기준(PostToolUse로 기록): 해당 스킬 호출, 공식 문서 도메인에 대한 WebFetch,
 * docs-researcher 서브에이전트 호출, next의 로컬 문서(node_modules/next/dist/docs) 읽기, `turbo docs`.
 * 개인정보를 남기지 않도록 프롬프트와 URL 전체는 저장하지 않고 주제 이름만 기록한다.
 *
 * @see https://code.claude.com/docs/ko/hooks
 */

import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { env, stdin } from 'node:process';

import { hashSession, logEvent, repoRelative } from './lib/log.mjs';
import { writeStateAtomically } from './lib/write-state.mjs';

const ROOT = env.CLAUDE_PROJECT_DIR || process.cwd();
const STATE_PATH = join(ROOT, '.claude/hooks/state/docs-consult.json');
const EDIT_TOOLS = new Set(['Write', 'Edit', 'MultiEdit']);

/** 주제별로: 어떤 편집이 해당하는지, 무엇을 하면 "확인했다"로 치는지, 알림 문구. */
const TOPICS = {
  turbo: {
    label: 'Turborepo',
    editPath: /(?:^|\/)turbo\.json$/,
    editContent: null,
    skills: [/^turborepo$/],
    hosts: [/(?:^|\.)turborepo\.(?:dev|com)$/, /(?:^|\.)turbo\.build$/],
    keyword: /turbo/i,
    advice:
      '`turborepo` 스킬을 호출하거나 `turbo docs "<질문>"`, docs-researcher로 공식 문서를 먼저 확인하십시오.',
  },
  motion: {
    label: 'Motion',
    editPath: null,
    editContent: /from ['"]motion(?:\/react(?:-client)?)?['"]/,
    skills: [/^motion-react$/, /^fixing-motion-performance$/],
    hosts: [/(?:^|\.)motion\.dev$/],
    keyword: /motion/i,
    advice:
      '`motion-react` 스킬을 호출하고 https://motion.dev/llms.txt 의 해당 페이지를 읽거나 docs-researcher로 확인하십시오.',
  },
  gsap: {
    label: 'GSAP',
    editPath: null,
    editContent: /from ['"]gsap(?:\/|['"])|@gsap\/react/,
    skills: [/^gsap-/],
    hosts: [/(?:^|\.)gsap\.com$/],
    keyword: /gsap|scrolltrigger/i,
    advice:
      '`gsap-*` 스킬(예: gsap-react, gsap-scrolltrigger)을 호출하거나 gsap.com 문서를 확인하십시오.',
  },
  next: {
    label: 'Next.js',
    editPath: /^apps\/(?:web|docs)\/(?:app|next\.config)/,
    editContent: /from ['"]next(?:\/|['"])|generateStaticParams|next\/dynamic/,
    skills: [],
    hosts: [/(?:^|\.)nextjs\.org$/],
    reads: [/node_modules\/next\/dist\/docs\//],
    keyword: /next/i,
    advice:
      '이 저장소의 Next는 학습 데이터와 다릅니다. `node_modules/next/dist/docs/`의 해당 가이드를 읽거나 docs-researcher로 확인하십시오(apps/web/AGENTS.md).',
  },
  radix: {
    label: 'Radix',
    editPath: null,
    editContent: /from ['"]@radix-ui\//,
    skills: [],
    hosts: [/(?:^|\.)radix-ui\.com$/],
    keyword: /radix/i,
    advice:
      'https://www.radix-ui.com/primitives/docs 의 해당 컴포넌트 문서를 읽거나 docs-researcher로 확인하십시오.',
  },
  storybook: {
    label: 'Storybook',
    editPath: /(?:\.stories\.tsx$|(?:^|\/)\.storybook\/)/,
    editContent: /from ['"]@storybook\//,
    skills: [],
    hosts: [/(?:^|\.)storybook\.js\.org$/],
    mcp: [/^mcp__storybook__/],
    keyword: /storybook|story|stories/i,
    advice:
      '스토리를 만들거나 고치기 전에 Storybook MCP의 `get-storybook-story-instructions`(`docs-list`/`docs-show`)를 호출하거나 https://storybook.js.org/docs 의 해당 페이지를 확인하십시오(CLAUDE.md).',
  },
  react: {
    label: 'React',
    editPath: null,
    editContent: /from ['"]react(?:-dom)?['"]/,
    skills: [/^vercel-react-best-practices$/],
    hosts: [/(?:^|\.)react\.dev$/],
    keyword: /react(?!-?native)/i,
    advice:
      '`vercel-react-best-practices` 스킬을 호출하거나 https://react.dev 의 해당 API(React 19: ref, use, useActionState 등)를 확인하십시오.',
  },
  tailwind: {
    label: 'Tailwind v4',
    editPath: /(?:^|\/)globals\.css$/,
    editContent: /@theme\b|@custom-variant\b|@utility\b/,
    skills: [],
    hosts: [/(?:^|\.)tailwindcss\.com$/],
    keyword: /tailwind/i,
    advice:
      'https://tailwindcss.com/docs 의 해당 페이지(theme, 변형)를 읽거나 docs-researcher로 확인하십시오.',
  },
};

async function readStdin() {
  const chunks = [];
  for await (const chunk of stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

function parseInput(raw) {
  try {
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function loadState(session) {
  try {
    if (existsSync(STATE_PATH)) {
      const state = JSON.parse(readFileSync(STATE_PATH, 'utf8'));
      if (state.session === session) {
        return state;
      }
    }
  } catch {
    // 깨진 상태 파일은 새로 시작한다
  }
  return { session, consulted: {}, nudged: {} };
}

function saveState(state) {
  try {
    mkdirSync(join(ROOT, '.claude/hooks/state'), { recursive: true });
    writeStateAtomically(STATE_PATH, JSON.stringify(state));
  } catch {
    // 상태 저장 실패는 알림에 영향을 주지 않는다
  }
}

/** 이번 편집이 새로 쓰는 텍스트를 모은다. */
function editedText(input) {
  const toolInput = input.tool_input || {};
  const parts = [toolInput.content, toolInput.new_string];
  if (Array.isArray(toolInput.edits)) {
    for (const edit of toolInput.edits) {
      parts.push(edit?.new_string);
    }
  }
  return parts.filter((part) => typeof part === 'string').join('\n');
}

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

const input = parseInput(await readStdin());
const session = hashSession(input.session_id);
const state = loadState(session);
const event = input.hook_event_name;
const tool = input.tool_name;

if (event === 'PostToolUse') {
  const toolInput = input.tool_input || {};
  const marked = [];
  for (const [topic, spec] of Object.entries(TOPICS)) {
    let hit = false;
    if (tool === 'Skill') {
      hit = spec.skills.some((pattern) => pattern.test(String(toolInput.skill || '')));
    } else if (tool === 'WebFetch') {
      const host = hostOf(toolInput.url);
      hit = spec.hosts.some((pattern) => pattern.test(host));
    } else if (tool === 'Agent') {
      hit =
        toolInput.subagent_type === 'docs-researcher' &&
        spec.keyword.test(String(toolInput.prompt || ''));
    } else if (tool.startsWith('mcp__')) {
      hit = (spec.mcp || []).some((pattern) => pattern.test(tool));
    } else if (tool === 'Read') {
      hit = (spec.reads || []).some((pattern) => pattern.test(String(toolInput.file_path || '')));
    } else if (tool === 'Bash') {
      hit = topic === 'turbo' && /\bturbo\s+docs\b/.test(String(toolInput.command || ''));
    }
    if (hit && !state.consulted[topic]) {
      state.consulted[topic] = true;
      marked.push(topic);
    }
  }
  if (marked.length > 0) {
    saveState(state);
    for (const topic of marked) {
      logEvent(input, { tool, decision: 'mark', reason: `docs_${topic}` });
    }
  }
  process.exit(0);
}

if (event === 'PreToolUse' && EDIT_TOOLS.has(tool)) {
  const filePath = repoRelative(input.tool_input?.file_path, ROOT) || '';
  const text = editedText(input);
  const missing = [];
  for (const [topic, spec] of Object.entries(TOPICS)) {
    const touches =
      (spec.editPath && spec.editPath.test(filePath)) ||
      (spec.editContent && spec.editContent.test(text));
    if (touches && !state.consulted[topic] && !state.nudged[topic]) {
      missing.push(topic);
    }
  }
  if (missing.length > 0) {
    for (const topic of missing) {
      state.nudged[topic] = true;
      logEvent(input, {
        tool,
        file: filePath || undefined,
        decision: 'nudge',
        reason: `docs_${topic}`,
      });
    }
    saveState(state);
    const lines = missing.map((topic) => `- ${TOPICS[topic].label}: ${TOPICS[topic].advice}`);
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          additionalContext: `이 편집은 외부 라이브러리 API에 의존하는데, 이 세션에서 공식 문서를 확인한 기록이 없습니다. 편집은 막지 않지만 구현 전에 아래를 먼저 확인하십시오(같은 주제는 이번 세션에 한 번만 알립니다).\n${lines.join('\n')}\n긴 문서는 docs-researcher 서브에이전트에 질문하면 요약만 받아 컨텍스트를 아낄 수 있습니다.`,
        },
      }),
    );
  }
}
