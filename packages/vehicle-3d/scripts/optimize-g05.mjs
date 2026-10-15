#!/usr/bin/env node
/**
 * BMW X5 G05 부품(.gltf, 데이터 URI로 버퍼 내장)을 웹 배포용 .glb 로 줄인다.
 *
 *   pnpm --filter @repo/vehicle-3d optimize:g05 [--src <폴더>] [--out <폴더>]
 *
 * 처리: glTF → GLB 변환(base64 풀기), dedup, prune(쓰이지 않는 데이터 제거), quantize(정점 16비트),
 * meshopt(EXT_meshopt_compression). 형상을 줄이는 simplify 는 하지 않는다.
 * 엠블럼 부품(O_G05_Emblem)은 상표라서 출력에서 뺀다.
 *
 * 입력은 `pnpm --filter @repo/ui copy:car` 가 받은 원본(CC BY 4.0, BMW Car IT)이다. 출력은 gitignore 된
 * Storybook models 폴더이며, 확인한 뒤에 앱의 public 으로 옮겨 커밋한다.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const MODELS = resolve(HERE, '../../ui/.storybook/public/models');

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? resolve(args[index + 1]) : fallback;
};
const src = option('--src', join(MODELS, 'g05'));
const out = option('--out', join(MODELS, 'g05-web'));
const bin = resolve(HERE, '../node_modules/.bin/gltf-transform');

if (!existsSync(src)) {
  console.error(
    `원본이 없습니다: ${src}\n먼저 \`pnpm --filter @repo/ui copy:car\` 를 실행하십시오.`,
  );
  process.exit(1);
}
mkdirSync(out, { recursive: true });

const run = (...cliArgs) => execFileSync(bin, cliArgs, { stdio: ['ignore', 'ignore', 'inherit'] });
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)}MB`;

let before = 0;
let after = 0;
const rows = [];
for (const file of readdirSync(src)
  .filter((name) => name.endsWith('.gltf'))
  .sort()) {
  if (file.includes('Emblem')) {
    console.log(`건너뜀 (상표): ${file}`);
    continue;
  }
  const target = join(out, file.replace(/\.gltf$/, '.glb'));
  const tmp = join(out, `.tmp-${file}.glb`);
  run('copy', join(src, file), tmp);
  run('dedup', tmp, tmp);
  run('prune', tmp, tmp);
  run('quantize', tmp, tmp);
  run('meshopt', tmp, target, '--level', 'medium');
  execFileSync('rm', ['-f', tmp]);
  const original = statSync(join(src, file)).size;
  const result = statSync(target).size;
  before += original;
  after += result;
  rows.push(`${file.padEnd(34)} ${mb(original).padStart(9)} → ${mb(result).padStart(8)}`);
}
console.log(rows.join('\n'));
console.log(
  `\n합계 ${mb(before)} → ${mb(after)} (${((1 - after / before) * 100).toFixed(0)}% 감소)`,
);
console.log(`출력: ${out}`);
