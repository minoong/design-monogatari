#!/usr/bin/env node
/**
 * shadcn 레지스트리를 `@repo/ui` 원본에서 생성한다.
 *
 *   node scripts/sync-registry.mjs           # registry/ 복사본과 registry.json 의 theme 항목을 다시 쓴다
 *   node scripts/sync-registry.mjs --check   # 쓰지 않고, 어긋나면 종료 코드 1로 실패한다 (CI용)
 *
 * 원본(`packages/ui/src`)이 유일한 출처다. 레지스트리에는 두 가지가 복사된다.
 *
 * 1. 컴포넌트: `registry/design-monogatari/<name>.tsx`. 원본에서 import 줄만 바꾼다.
 *      ./lib/cn  -> @/lib/utils      (소비자의 utils 별칭)
 *      ./lib/motion -> @/lib/motion  (모션 토큰, 레지스트리 lib 항목)
 *      ./<형제>   -> @/ui/<형제>      (shadcn CLI가 소비자의 ui 별칭으로 바꿔 준다)
 * 2. 테마: `registry.json` 의 `theme` 항목(cssVars, css). `packages/ui/src/styles/globals.css`
 *    의 @theme, :root/.light, .dark, @keyframes 에서 만든다.
 *
 * 테마를 이렇게 만드는 이유는 소비자 앱에 실제로 설치해 보고 얻은 결과다.
 *   - 팔레트(`--color-neutral-*`, `--color-blue-*`)를 theme 그룹에 넣으면 CLI가
 *     `--color-color-*` 변수를 중복 생성한다. light 그룹에 넣으면 `--color-*` 매핑이 올바르게 만들어진다.
 *   - `color-mix(...)` 값은 CLI가 색으로 인식하지 못해 `--color-overlay` 매핑이 빠지고
 *     `bg-overlay` 유틸리티가 생기지 않는다. 같은 색의 `rgb(r g b / n%)`로 바꿔 쓴다.
 *   - `@keyframes` 와 `--animate-*` 가 없으면 Button 로딩 점이 움직이지 않는다.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { format, resolveConfig } from 'prettier';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'packages/ui/src');
const CSS_PATH = join(SRC, 'styles/globals.css');
const REGISTRY_JSON = join(ROOT, 'registry.json');
const check = process.argv.includes('--check');

const drift = [];

function say(message) {
  process.stdout.write(`${message}\n`);
}

/** 저장소 Prettier 설정으로 서식을 맞춘다. 생성물이 `pnpm format:check`를 깨뜨리지 않게 한다. */
async function formatted(path, text) {
  const config = (await resolveConfig(path)) ?? {};
  return format(text, { ...config, filepath: path });
}

async function writeOrCheck(path, text, label) {
  const next = await formatted(path, text);
  let current = null;
  try {
    current = readFileSync(path, 'utf8');
  } catch {
    // 아직 없는 파일
  }
  if (current === next) {
    return;
  }
  if (check) {
    drift.push(label);
    return;
  }
  writeFileSync(path, next);
  say(`  갱신: ${label}`);
}

// ---------------------------------------------------------------- 1. 컴포넌트

const registry = JSON.parse(readFileSync(REGISTRY_JSON, 'utf8'));
const uiItems = registry.items.filter((item) => item.type === 'registry:ui');
const uiNames = new Set(uiItems.map((item) => item.name));

/** 원본 컴포넌트를 레지스트리용으로 바꾼다. import 줄 외에는 한 글자도 건드리지 않는다. */
export function transformComponent(source) {
  return source
    .replace(/from '\.\/lib\/cn'/g, "from '@/lib/utils'")
    .replace(/from '\.\/lib\/motion'/g, "from '@/lib/motion'")
    .replace(/from '\.\/([a-z0-9-]+)'/g, (match, sibling) =>
      uiNames.has(sibling) ? `from '@/ui/${sibling}'` : match,
    );
}

for (const item of uiItems) {
  const file = item.files.find((entry) => entry.path.startsWith('registry/'));
  if (!file) {
    continue;
  }
  const source = readFileSync(join(SRC, `${item.name}.tsx`), 'utf8');
  const leftovers = transformComponent(source).match(/from '\.\.?\//g);
  if (leftovers) {
    drift.push(
      `${item.name}: 변환 뒤에도 상대 import 가 남아 있습니다 (레지스트리에 없는 형제를 가져옴)`,
    );
  }
  await writeOrCheck(join(ROOT, file.path), transformComponent(source), file.path);
}

// ---------------------------------------------------------------- 2. 테마

const css = readFileSync(CSS_PATH, 'utf8');

/** 중괄호 짝을 맞춰 `header { ... }` 의 안쪽 본문을 모두 찾는다. */
function blocks(text, header) {
  const found = [];
  let from = 0;
  while (true) {
    const start = text.indexOf(header, from);
    if (start < 0) {
      return found;
    }
    const open = text.indexOf('{', start);
    let depth = 0;
    let end = open;
    for (; end < text.length; end += 1) {
      if (text[end] === '{') depth += 1;
      if (text[end] === '}') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    found.push(text.slice(open + 1, end));
    from = end + 1;
  }
}

function declarations(body) {
  const result = {};
  for (const match of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    result[match[1]] = match[2].replace(/\s+/g, ' ').trim();
  }
  return result;
}

const themeDecl = declarations(blocks(css, '@theme inline')[0]);
const rootDecl = declarations(blocks(css, ':root,\n.light')[0]);
const darkDecl = declarations(blocks(css, '\n.dark {')[0]);
const paletteDark = declarations(blocks(css, ':root {')[0]);

/** 변수 참조를 모두 값으로 풀어 쓴다. 모르는 변수(--font-geist-sans 등)는 그대로 둔다. */
function resolve(value, scope) {
  return value.replace(/var\((--[\w-]+)\)/g, (match, name) =>
    scope[name] === undefined ? match : resolve(scope[name], scope),
  );
}

/** color-mix(in srgb, #rrggbb N%, transparent) 를 rgb(r g b / N%) 로 바꾼다. CLI가 색으로 인식하는 형식이다. */
function toRgb(value) {
  return value.replace(
    /color-mix\(in srgb,\s*#([0-9a-f]{6})\s+(\d+)%,\s*transparent\)/gi,
    (match, hex, percent) => {
      const [r, g, b] = [0, 2, 4].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
      return `rgb(${r} ${g} ${b} / ${percent}%)`;
    },
  );
}

const palette = {};
const theme = {};
for (const [name, value] of Object.entries(themeDecl)) {
  const key = name.slice(2);
  if (/^--color-(?:neutral|blue)-\d+$/.test(name)) {
    palette[key.slice('color-'.length)] = value;
  } else if (!name.startsWith('--color-')) {
    theme[key] = value;
  }
}

/** `--color-x: var(--y)` 중 x 와 y 가 다른 매핑(--color-muted-strong: var(--border))은 변수 x 로 풀어 둔다 */
const aliases = Object.entries(themeDecl)
  .filter(([name]) => name.startsWith('--color-'))
  .map(([name, value]) => [name.slice('--color-'.length), value.match(/^var\(--([\w-]+)\)$/)?.[1]])
  .filter(([name, target]) => target && name !== target);

function semantic(source, scope) {
  const result = {};
  for (const [name, value] of Object.entries(source)) {
    result[name.slice(2)] = toRgb(resolve(value, scope));
  }
  for (const [name, target] of aliases) {
    if (result[target] !== undefined && result[name] === undefined) {
      result[name] = result[target];
    }
  }
  return result;
}

const lightScope = {
  ...Object.fromEntries(Object.entries(themeDecl).filter(([n]) => n.startsWith('--color-'))),
};
const light = { ...palette, ...semantic(rootDecl, lightScope) };
const darkScope = { ...lightScope, ...paletteDark };
const dark = semantic({ ...darkDecl }, darkScope);

/** @keyframes 를 shadcn 의 css 형식({ '@keyframes name': { 'from': { prop: value } } })으로 */
const keyframes = {};
for (const match of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
  const body = blocks(css.slice(match.index), '@keyframes')[0];
  const frames = {};
  for (const frame of body.matchAll(/([^{}]+?)\s*\{([^}]*)\}/g)) {
    const selector = frame[1].replace(/\s+/g, ' ').trim();
    frames[selector] = declarationsPlain(frame[2]);
  }
  keyframes[`@keyframes ${match[1]}`] = frames;
}

function declarationsPlain(body) {
  const result = {};
  for (const match of body.matchAll(/([\w-]+)\s*:\s*([^;]+);/g)) {
    result[match[1]] = match[2].trim();
  }
  return result;
}

const themeItem = registry.items.find((item) => item.name === 'theme');
themeItem.cssVars = { theme, light, dark };
themeItem.css = keyframes;
await writeOrCheck(
  REGISTRY_JSON,
  `${JSON.stringify(registry, null, 2)}\n`,
  'registry.json (theme)',
);

// ---------------------------------------------------------------- 결과

if (check) {
  if (drift.length > 0) {
    say('레지스트리가 원본과 어긋나 있습니다. `pnpm registry:sync` 로 다시 생성하십시오:');
    for (const entry of drift) {
      say(`  - ${entry}`);
    }
    process.exit(1);
  }
  say('레지스트리가 원본과 일치합니다.');
} else {
  say(
    `sync-registry: 컴포넌트 ${uiItems.length}개, 테마(cssVars ${Object.keys(theme).length}/${Object.keys(light).length}/${Object.keys(dark).length}, keyframes ${Object.keys(keyframes).length}) 동기화 완료`,
  );
}
