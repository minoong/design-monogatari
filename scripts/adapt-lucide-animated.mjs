#!/usr/bin/env node
/**
 * lucide-animated(https://lucide-animated.com) 아이콘을 이 저장소의 방식으로 옮긴다.
 *
 *   node scripts/adapt-lucide-animated.mjs arrow-left check x            # 네트워크에서 가져온다
 *   node scripts/adapt-lucide-animated.mjs --dir ./downloaded arrow-left  # 내려받아 둔 <name>.json 에서 읽는다
 *
 * 업스트림 아이콘은 `<div>` 래퍼에 마우스 이벤트만 듣고 접근성 속성과 감소 모션 처리가 없다. 여기서는 변형(variants)과 SVG는
 * 그대로 가져오고, 래퍼를 `IconFrame`(aria-hidden span)으로, 이벤트와 제어를 `useAnimatedIcon`(부모 제어 `isHovered`, 감소 모션)으로
 * 바꿔 `packages/ui/src/icons/<name>.tsx`에 쓴다. 제어가 하나(`useAnimation()` 한 번)인 아이콘만 지원한다.
 * 쓴 뒤에는 `pnpm exec prettier --write` 와 eslint --fix 를 돌린다. MIT(pqoqubbw/icons)라 출처 표기를 파일 머리에 붙인다.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const OUT = path.resolve(import.meta.dirname, '../packages/ui/src/icons');
const args = process.argv.slice(2);
const dirIndex = args.indexOf('--dir');
const dir = dirIndex >= 0 ? args.splice(dirIndex, 2)[1] : null;

async function load(name) {
  const raw = dir
    ? await readFile(path.join(dir, `${name}.json`), 'utf8')
    : await (await fetch(`https://lucide-animated.com/r/${name}.json`)).text();
  const content = JSON.parse(raw).files?.[0]?.content;
  if (!content) throw new Error(`${name}: 소스를 찾을 수 없습니다`);
  return content;
}

function adapt(name, source) {
  const component = /const (\w+Icon) = forwardRef</.exec(source)?.[1];
  if (!component) throw new Error(`${name}: 컴포넌트 이름을 찾지 못했습니다`);
  if ((source.match(/useAnimation\(\)/g) ?? []).length !== 1) {
    throw new Error(`${name}: 제어가 둘 이상인 아이콘은 지원하지 않습니다(직접 옮기십시오)`);
  }
  // 변형 이름이 normal/animate가 아닌 아이콘(receipt-text는 hidden/visible, layers는 firstState 등)은 마우스 제어가 다르다.
  const variantNames = new Set(
    [...source.matchAll(/controls\.start\("(\w+)"\)/g)].map((m) => m[1]),
  );
  if (
    ![...variantNames].every((variantName) => variantName === 'animate' || variantName === 'normal')
  ) {
    throw new Error(
      `${name}: 변형 이름이 normal/animate가 아닙니다(${[...variantNames].join(', ')}). 직접 옮기십시오.`,
    );
  }

  // 변형 정의와 보조 상수: 마지막 import 다음부터 컴포넌트 시작 전까지(인터페이스는 우리 것으로 다시 쓰므로 뺀다).
  const lastImport = [...source.matchAll(/^import[\s\S]*?;\s*$/gm)].at(-1);
  const bodyStart = (lastImport?.index ?? 0) + (lastImport?.[0].length ?? 0);
  const variants = source
    .slice(bodyStart, source.indexOf(`const ${component} = forwardRef`))
    .replace(/(export )?interface \w+\s*(extends [^{]+)?\{[^}]*\}/g, '')
    .trim();
  const motionTypes = ['Variants', 'Transition'].filter((type) =>
    new RegExp(`\\b${type}\\b`).test(variants),
  );
  const typeImport = motionTypes.map((type) => `type ${type}`).join(', ');

  // 루트가 `<svg>`이거나 `<motion.svg>`(회전처럼 SVG 전체를 움직이는 아이콘)일 수 있다.
  const open = /<(motion\.)?svg\b/.exec(source);
  if (!open) throw new Error(`${name}: SVG를 찾지 못했습니다`);
  const closeTag = `</${open[1] ?? ''}svg>`;
  const svgEnd = source.indexOf(closeTag, open.index) + closeTag.length;
  const svg = source
    .slice(open.index, svgEnd)
    .replace(/^<(motion\.)?svg/, (tag) => `${tag} focusable="false"`);

  return `// lucide-animated(MIT, Copyright pqoqubbw)의 ${name} 아이콘을 scripts/adapt-lucide-animated.mjs로 옮겼다.
'use client';

import { motion${typeImport ? ', ' + typeImport : ''} } from 'motion/react';
import { forwardRef, type HTMLAttributes, useImperativeHandle } from 'react';

import { IconFrame } from './icon-frame';
import { useAnimatedIcon } from './use-animated-icon';

export type ${component}Handle = {
  startAnimation: () => void;
  stopAnimation: () => void;
};

type ${component}Props = {
  isHovered?: boolean;
  size?: number;
} & HTMLAttributes<HTMLSpanElement>;

${variants}

export const ${component} = forwardRef<${component}Handle, ${component}Props>(function ${component}(
  { onMouseEnter, onMouseLeave, className, isHovered, size = 24, ...props },
  ref,
) {
  const { controls, handleMouseEnter, handleMouseLeave, play, stop } = useAnimatedIcon(
    isHovered,
    onMouseEnter,
    onMouseLeave,
  );

  useImperativeHandle(ref, () => ({
    startAnimation: play,
    stopAnimation: stop,
  }));

  return (
    <IconFrame
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      ${svg}
    </IconFrame>
  );
});
`;
}

for (const name of args) {
  const output = adapt(name, await load(name));
  await writeFile(path.join(OUT, `${name}.tsx`), output);
  console.log(`쓴 파일: packages/ui/src/icons/${name}.tsx`);
}
