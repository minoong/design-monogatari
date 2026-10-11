#!/usr/bin/env node
/**
 * build-storybook 후처리: 로컬 전용 3D 에셋을 정적 빌드 결과물에서 제거한다.
 *
 * `.storybook/public`은 통째로 `storybook-static`에 복사되므로, `pnpm copy:car`로 받아 둔
 * 모델(g05)·HDR이 있으면 배포물에 그대로 들어간다. 라이선스와 로컬 전용 방침상 빌드 결과물에는
 * 포함하지 않는다. 지운 뒤에도 3D 에셋이 남아 있으면 실패한다.
 */

import { readdir, rm } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'storybook-static');
const MODEL_FILE = /\.(?:gltf|glb|fbx|hdr|exr|bin)$/i;

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory() ? listFiles(join(dir, entry.name)) : [join(dir, entry.name)],
    ),
  );
  return nested.flat();
}

function say(message) {
  process.stdout.write(`${message}\n`);
}

let before;
try {
  before = await listFiles(outDir);
} catch {
  say(`prune-storybook-models: ${relative(root, outDir)} 없음, 건너뜀`);
  process.exit(0);
}

await rm(join(outDir, 'models'), { recursive: true, force: true });

const leftovers = (await listFiles(outDir)).filter((file) => MODEL_FILE.test(file));
if (leftovers.length > 0) {
  say('prune-storybook-models: 3D 에셋이 빌드 결과물에 남아 있습니다.');
  for (const file of leftovers) {
    say(`  - ${relative(root, file)}`);
  }
  process.exit(1);
}

const removed = before.length - (await listFiles(outDir)).length;
say(`prune-storybook-models: models/ 제거 (${removed}개 파일), 3D 에셋 없음 확인`);
