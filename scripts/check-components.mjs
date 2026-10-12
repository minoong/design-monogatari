#!/usr/bin/env node
/**
 * 공개 컴포넌트가 "구현 → 스토리 → 예시·문서 → 레지스트리 → DESIGN.md"를 모두 갖췄는지 검사한다.
 *
 *   node scripts/check-components.mjs                 # 전체 검사, 누락이 있으면 종료 코드 1
 *   node scripts/check-components.mjs --component button
 *   node scripts/check-components.mjs --changed       # git 에서 바뀐 컴포넌트만
 *   node scripts/check-components.mjs --json          # 기계가 읽는 출력
 *   node scripts/check-components.mjs --summary       # 한 줄 요약 (스킬의 동적 컨텍스트용, 항상 종료 코드 0)
 *
 * 왜 필요한가: 새 `.tsx`를 만들고 스토리나 문서 페이지나 registry.json 항목을 빠뜨려도 지금까지는
 * 어떤 검사도 실패하지 않았다. 이 스크립트가 `pnpm verify`에 들어가므로 CI와 Stop 훅이 누락을 막는다.
 *
 * 공개 컴포넌트 = packages/ui/src/*.tsx 중 *.stories.tsx 와 packages/ui/components.config.json 의 internal 을
 * 뺀 것. 예외(레지스트리 제외, 문서 제외)는 같은 파일에 이유와 함께 적는다.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'packages/ui/src');
const DOCS = join(ROOT, 'apps/docs/content/docs/components');
const EXAMPLES = join(ROOT, 'apps/docs/src/_examples');
const TODO = 'TODO(scaffold)';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function pascal(name) {
  return name
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
}

function listFiles(dir, predicate) {
  return existsSync(dir) ? readdirSync(dir).filter(predicate) : [];
}

const config = readJson(join(SRC, '..', 'components.config.json'));
const registry = readJson(join(ROOT, 'registry.json'));
const docsMeta = existsSync(join(DOCS, 'meta.json'))
  ? readJson(join(DOCS, 'meta.json'))
  : { pages: [] };
const design = readFileSync(join(ROOT, 'DESIGN.md'), 'utf8');

const components = listFiles(SRC, (file) => file.endsWith('.tsx') && !file.endsWith('.stories.tsx'))
  .map((file) => file.slice(0, -'.tsx'.length))
  .filter((name) => !(name in config.internal))
  .sort();

/** @type {{ component: string, rule: string, message: string, fix: string }[]} */
const problems = [];
function report(component, rule, message, fix) {
  problems.push({ component, rule, message, fix });
}

function hasTodo(path) {
  return existsSync(path) && readFileSync(path, 'utf8').includes(TODO);
}

function checkComponent(name) {
  const file = join(SRC, `${name}.tsx`);
  const story = join(SRC, `${name}.stories.tsx`);
  if (!existsSync(story)) {
    report(
      name,
      'story',
      `packages/ui/src/${name}.stories.tsx 가 없습니다`,
      `스토리를 만든다 (기존 스토리 예: badge.stories.tsx)`,
    );
  }

  // 레지스트리
  const registryExcluded = name in config.registry.exclude;
  const item = registry.items.find((entry) => entry.name === name && entry.type === 'registry:ui');
  if (!registryExcluded) {
    if (!item) {
      report(
        name,
        'registry',
        `registry.json 에 ${name} 항목이 없습니다`,
        `registry.json 에 항목을 추가하고 pnpm registry:sync 를 실행한다`,
      );
    } else {
      const copy = item.files?.find((entry) => entry.path.startsWith('registry/'));
      if (!copy || !existsSync(join(ROOT, copy.path))) {
        report(
          name,
          'registry',
          `registry 복사본이 없습니다 (${copy?.path ?? 'files 없음'})`,
          `pnpm registry:sync 를 실행한다`,
        );
      }
    }
  }

  // 문서 페이지, 내비게이션, 예시
  const docsExcluded = name in config.docs.exclude;
  const mdx = join(DOCS, `${name}.mdx`);
  if (!docsExcluded) {
    if (!existsSync(mdx)) {
      report(
        name,
        'docs-page',
        `apps/docs/content/docs/components/${name}.mdx 가 없습니다`,
        `button.mdx 형식으로 문서 페이지를 만든다`,
      );
    } else {
      if (!docsMeta.pages.includes(name)) {
        report(
          name,
          'docs-nav',
          `components/meta.json 의 pages 에 ${name} 이 없습니다`,
          `pages 에 추가한다`,
        );
      }
      const body = readFileSync(mdx, 'utf8');
      const referenced = [...body.matchAll(/<ComponentPreview\s+name="([^"]+)"/g)].map(
        (match) => match[1],
      );
      if (!referenced.some((ref) => ref.startsWith(`${name}/`))) {
        report(
          name,
          'example',
          `${name}.mdx 에 <ComponentPreview name="${name}/..."> 가 없습니다`,
          `예시를 만들고 페이지에 넣는다`,
        );
      }
      for (const ref of referenced) {
        // 스캐폴드의 안내 문구(`name="x/..."`)는 실제 참조가 아니다 (TODO 규칙이 따로 잡는다)
        if (ref.includes('...')) {
          continue;
        }
        if (!existsSync(join(EXAMPLES, `${ref}.tsx`))) {
          report(
            name,
            'example',
            `예시 파일이 없습니다: apps/docs/src/_examples/${ref}.tsx`,
            `파일을 만들거나 참조를 고친다`,
          );
        }
      }
    }
    const examples = listFiles(join(EXAMPLES, name), (entry) => entry.endsWith('.tsx'));
    if (examples.length === 0) {
      report(
        name,
        'example',
        `apps/docs/src/_examples/${name}/ 에 예시가 없습니다`,
        `예시를 하나 이상 만든다`,
      );
    }
  }

  // DESIGN.md
  if (!design.includes(pascal(name))) {
    report(
      name,
      'design-md',
      `DESIGN.md 에 ${pascal(name)} 항목이 없습니다`,
      `Components 절에 계약(variant, 접근성, 토큰)을 적는다`,
    );
  }

  // 스캐폴드가 남긴 자리표시자
  const todoFiles = [
    file,
    story,
    mdx,
    ...listFiles(join(EXAMPLES, name), (entry) => entry.endsWith('.tsx')).map((entry) =>
      join(EXAMPLES, name, entry),
    ),
  ];
  for (const path of todoFiles) {
    if (hasTodo(path)) {
      report(
        name,
        'todo',
        `${path.replace(`${ROOT}/`, '')} 에 ${TODO} 표시가 남아 있습니다`,
        `내용을 채우고 표시를 지운다`,
      );
    }
  }
  if (item && JSON.stringify(item).includes(TODO)) {
    report(
      name,
      'todo',
      `registry.json ${name} 항목에 ${TODO} 표시가 남아 있습니다`,
      `title, description 을 채운다`,
    );
  }
  if (
    design.includes(`${TODO}: ${pascal(name)}`) ||
    new RegExp(`### ${pascal(name)}\\n[\\s\\S]*?${TODO}`).test(design)
  ) {
    report(
      name,
      'todo',
      `DESIGN.md ${pascal(name)} 항목에 ${TODO} 표시가 남아 있습니다`,
      `계약을 채우고 표시를 지운다`,
    );
  }
}

// 설정 파일이 존재하지 않는 컴포넌트를 가리키면 낡은 예외다
for (const group of [config.registry.exclude, config.docs.exclude]) {
  for (const name of Object.keys(group)) {
    if (!components.includes(name)) {
      report(
        name,
        'config',
        `components.config.json 의 예외가 없는 컴포넌트를 가리킵니다: ${name}`,
        `예외를 지운다`,
      );
    }
  }
}

let targets = components;
if (option('--component')) {
  targets = [option('--component')];
} else if (flag('--changed')) {
  const run = (cmd, cmdArgs) => {
    try {
      return execFileSync(cmd, cmdArgs, {
        cwd: ROOT,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
    } catch {
      return '';
    }
  };
  const changed = `${run('git', ['diff', '--name-only', 'main...HEAD'])}\n${run('git', ['status', '--porcelain'])}`;
  const touched = new Set();
  for (const name of components) {
    if (
      changed.includes(`packages/ui/src/${name}.`) ||
      changed.includes(`components/${name}.mdx`) ||
      changed.includes(`_examples/${name}/`)
    ) {
      touched.add(name);
    }
  }
  targets = [...touched];
}

for (const name of targets) {
  if (!components.includes(name)) {
    report(
      name,
      'unknown',
      `packages/ui/src/${name}.tsx 가 없는 컴포넌트입니다`,
      `이름을 확인한다`,
    );
    continue;
  }
  checkComponent(name);
}

const scoped = problems.filter(
  (problem) =>
    problem.rule === 'config' || targets.includes(problem.component) || problem.rule === 'unknown',
);

if (flag('--json')) {
  process.stdout.write(
    `${JSON.stringify({ ok: scoped.length === 0, checked: targets, problems: scoped }, null, 2)}\n`,
  );
} else if (flag('--summary')) {
  const missing = [...new Set(scoped.map((problem) => problem.component))];
  process.stdout.write(
    scoped.length === 0
      ? `components:check — 공개 컴포넌트 ${components.length}개 모두 갖춰져 있습니다.\n`
      : `components:check — 누락이 있는 컴포넌트: ${missing.join(', ')} (${scoped.length}건). pnpm components:check 로 자세히 본다.\n`,
  );
} else if (scoped.length === 0) {
  process.stdout.write(`components:check — ${targets.length}개 검사, 누락 없음\n`);
} else {
  process.stdout.write(`components:check — ${scoped.length}건의 누락\n`);
  for (const problem of scoped) {
    process.stdout.write(
      `  [${problem.component}] (${problem.rule}) ${problem.message}\n      → ${problem.fix}\n`,
    );
  }
}

process.exit(scoped.length > 0 && !flag('--summary') ? 1 : 0);
