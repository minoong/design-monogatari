#!/usr/bin/env node
/**
 * 새 @repo/ui 컴포넌트의 뼈대를 한 번에 만든다.
 *
 *   pnpm component:new <kebab-name> [--compound]
 *
 * 만드는 것 (모두 `TODO(scaffold)` 표시가 있어서 채우기 전에는 `pnpm components:check` 가 실패한다):
 *   packages/ui/src/<name>.tsx            컴포넌트 (--compound 면 Root + 조각)
 *   packages/ui/src/<name>.stories.tsx    스토리 (한글 제목)
 *   apps/docs/src/_examples/<name>/basic.tsx   문서 예시
 *   apps/docs/content/docs/components/<name>.mdx   문서 페이지 (+ meta.json pages)
 *   registry.json                         registry:ui 항목 (+ pnpm registry:sync 로 복사본 생성)
 *   DESIGN.md                             Components 절의 빈 항목
 *
 * 이미 있는 파일은 건드리지 않고 중단한다. 깨져 있던 `turbo gen react-component` 를 대체한다.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TODO = 'TODO(scaffold)';

const args = process.argv.slice(2);
const name = args.find((arg) => !arg.startsWith('--'));
const compound = args.includes('--compound');

function fail(message) {
  process.stderr.write(`component:new — ${message}\n`);
  process.exit(1);
}

if (!name || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name)) {
  fail('사용법: pnpm component:new <kebab-name> [--compound]  (예: option-row)');
}

const Pascal = name
  .split('-')
  .map((part) => part[0].toUpperCase() + part.slice(1))
  .join('');
const camel = Pascal[0].toLowerCase() + Pascal.slice(1);
const title = `컴포넌트/${Pascal}`;

const paths = {
  component: join(ROOT, `packages/ui/src/${name}.tsx`),
  story: join(ROOT, `packages/ui/src/${name}.stories.tsx`),
  example: join(ROOT, `apps/docs/src/_examples/${name}/basic.tsx`),
  page: join(ROOT, `apps/docs/content/docs/components/${name}.mdx`),
};
for (const path of Object.values(paths)) {
  if (existsSync(path)) {
    fail(`이미 있습니다: ${path.replace(`${ROOT}/`, '')}. 아무것도 만들지 않았습니다.`);
  }
}

const componentSource = compound
  ? `import { type HTMLAttributes } from 'react';

import { cn } from './lib/cn';

// ${TODO}: 조각(Root, Header 등)을 정한다. 컴파운드 패턴 기준은 packages/ui/src/dialog.tsx, card.tsx
export function ${Pascal}({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />;
}

export function ${Pascal}Header({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('', className)} {...props} />;
}
`
  : `import { cva, type VariantProps } from 'class-variance-authority';
import { type HTMLAttributes } from 'react';

import { cn } from './lib/cn';

// ${TODO}: variant 와 마크업을 구현한다. 단일 컨트롤 패턴 기준은 packages/ui/src/badge.tsx, button.tsx
export const ${camel}Variants = cva('', {
  variants: {
    variant: {
      default: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type ${Pascal}Props = HTMLAttributes<HTMLDivElement> & VariantProps<typeof ${camel}Variants>;

export function ${Pascal}({ className, variant, ...props }: ${Pascal}Props) {
  return <div className={cn(${camel}Variants({ variant }), className)} {...props} />;
}
`;

const storySource = `import type { Meta, StoryObj } from '@storybook/react-vite';

import { ${Pascal} } from './${name}';

// ${TODO}: 설명과 스토리를 채운다 (한글). 상태별 스토리 + 접근성 포인트를 문서에 적는다
const meta = {
  title: '${title}',
  component: ${Pascal},
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '${TODO}',
      },
    },
  },
  args: {
    children: '${Pascal}',
  },
} satisfies Meta<typeof ${Pascal}>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};
`;

const exampleSource = `import { ${Pascal} } from '@repo/ui/${name}';

// ${TODO}: 문서의 첫 예시. 코드 탭에 그대로 보이므로 사용자가 복사해 쓸 수 있는 형태로 쓴다
export default function ${Pascal}Basic() {
  return <${Pascal}>${Pascal}</${Pascal}>;
}
`;

const pageSource = `---
title: ${Pascal}
description: ${TODO} 한 문장으로 무엇을 하는 컴포넌트인지 쓴다.
---

<ComponentPreview name="${name}/basic" />

## 설치

<InstallTabs name="${name}" />

<Callout type="warn" title="Radix 기반 shadcn 프로젝트가 필요합니다">
  \`shadcn init -b radix\`로 초기화한 프로젝트에서 설치합니다.
</Callout>

## 사용법

${TODO} import 와 최소 사용 코드, 언제 쓰고 언제 쓰지 말지.

## 예시

${TODO} 변형·상태별 예시를 \`<ComponentPreview name="${name}/..." />\`로 추가한다.

## API 레퍼런스

${TODO} 직접 정의한 props 는 <PropsTable file="packages/ui/src/${name}.tsx" name="${Pascal}Props" include={[...]} descriptions={{...}} /> 로, 정의한 prop 이 없으면 표로 쓴다.

## 접근성

${TODO} 키보드, 이름/역할/상태, 포커스, 대비, 감소 모션을 사실대로 적는다 (모르면 확인한다).

## 소스

<RepoFile path="packages/ui/src/${name}.tsx" />
`;

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  process.stdout.write(`  만듦: ${path.replace(`${ROOT}/`, '')}\n`);
}

write(paths.component, componentSource);
write(paths.story, storySource);
write(paths.example, exampleSource);
write(paths.page, pageSource);

// 문서 내비게이션
const metaPath = join(ROOT, 'apps/docs/content/docs/components/meta.json');
const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
if (!meta.pages.includes(name)) {
  meta.pages.push(name);
  writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`);
  process.stdout.write('  고침: apps/docs/content/docs/components/meta.json\n');
}

// 레지스트리 항목 (복사본은 registry:sync 가 생성)
const registryPath = join(ROOT, 'registry.json');
const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
registry.items.push({
  name,
  type: 'registry:ui',
  title: Pascal,
  description: TODO,
  dependencies: compound
    ? ['clsx', 'tailwind-merge']
    : ['class-variance-authority', 'clsx', 'tailwind-merge'],
  registryDependencies: ['minoong/design-monogatari/cn', 'minoong/design-monogatari/theme'],
  files: [
    {
      path: `registry/design-monogatari/${name}.tsx`,
      type: 'registry:ui',
      target: `@ui/${name}.tsx`,
    },
  ],
});
writeFileSync(registryPath, `${JSON.stringify(registry, null, 2)}\n`);
process.stdout.write('  고침: registry.json\n');

// DESIGN.md
const designPath = join(ROOT, 'DESIGN.md');
const design = readFileSync(designPath, 'utf8');
// Components 절 맨 끝: "### Do" 소제목 바로 앞에 넣는다.
const marker = '### Do\n';
if (!design.includes(marker)) {
  fail('DESIGN.md 에서 삽입 위치를 찾지 못했습니다');
}
writeFileSync(
  designPath,
  design.replace(
    marker,
    `### ${Pascal}\n\n- ${TODO}: 계약(variant, 접근성, 토큰)을 적는다.\n\n${marker}`,
  ),
);
process.stdout.write('  고침: DESIGN.md\n');

const sync = spawnSync('node', [join(ROOT, 'scripts/sync-registry.mjs')], {
  cwd: ROOT,
  stdio: 'inherit',
});
if (sync.status !== 0) {
  fail('pnpm registry:sync 가 실패했습니다');
}

process.stdout.write(`
다음 단계 (create-component 스킬 순서):
  1. packages/ui/src/${name}.tsx 구현 → 스토리 → 예시 → 문서 페이지를 채우고 ${TODO} 를 지운다
  2. a11y-reviewer 서브에이전트로 접근성 리뷰
  3. pnpm registry:sync && pnpm components:check
  4. ui-verifier(라이트/다크) → pnpm verify
`);
