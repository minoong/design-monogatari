#!/usr/bin/env node
/**
 * shadcn 레지스트리를 정적 JSON(`apps/docs/public/r/*.json`)으로 빌드한다.
 *
 *   SITE_URL=https://example.com node scripts/build-registry.mjs
 *
 * 커밋된 `registry.json`의 `registryDependencies`는 `minoong/design-monogatari/<name>`
 * (GitHub 레지스트리 식별자)다. 이 상태로 URL 호스팅을 하면 항목끼리의 의존성이 호스팅한 JSON이
 * 아니라 GitHub의 `main`을 가리켜서, 두 출처가 섞인다. 그래서 빌드할 때만 `${SITE_URL}/r/<name>.json`
 * 전체 URL로 바꾼 임시 레지스트리를 만들어 `shadcn build`에 넘긴다. 커밋된 파일은 건드리지 않는다.
 *
 * SITE_URL 기본값은 로컬 문서 앱(http://localhost:3001)이다.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'apps/docs/public/r');
const GITHUB_PREFIX = 'minoong/design-monogatari/';

function say(message) {
  process.stdout.write(`${message}\n`);
}

function fail(message) {
  process.stderr.write(`build-registry: ${message}\n`);
  process.exit(1);
}

const siteUrl = (process.env.SITE_URL || 'http://localhost:3001').replace(/\/+$/, '');
if (!/^https?:\/\/[^\s/]+(?::\d+)?(?:\/[^\s]*)?$/.test(siteUrl)) {
  fail(`SITE_URL 형식이 올바르지 않습니다: ${siteUrl}`);
}

const registry = JSON.parse(readFileSync(join(ROOT, 'registry.json'), 'utf8'));
const names = new Set(registry.items.map((item) => item.name));

let rewritten = 0;
for (const item of registry.items) {
  if (!item.registryDependencies) {
    continue;
  }
  item.registryDependencies = item.registryDependencies.map((dependency) => {
    if (!dependency.startsWith(GITHUB_PREFIX)) {
      return dependency;
    }
    const name = dependency.slice(GITHUB_PREFIX.length);
    if (!names.has(name)) {
      fail(
        `${item.name}: registryDependencies가 레지스트리에 없는 항목을 가리킵니다 (${dependency})`,
      );
    }
    rewritten += 1;
    return `${siteUrl}/r/${name}.json`;
  });
}
registry.homepage = siteUrl;

const tempDir = mkdtempSync(join(tmpdir(), 'dm-registry-'));
const tempRegistry = join(tempDir, 'registry.json');
writeFileSync(tempRegistry, JSON.stringify(registry, null, 2));

// 항목의 files[].path 는 저장소 루트 기준이므로 cwd 를 루트로 둔다
rmSync(OUT_DIR, { recursive: true, force: true });
const shadcn = join(ROOT, 'node_modules/.bin/shadcn');
if (!existsSync(shadcn)) {
  fail('shadcn CLI가 없습니다. `pnpm install` 후 다시 실행하십시오.');
}
const result = spawnSync(shadcn, ['build', tempRegistry, '--output', OUT_DIR], {
  cwd: ROOT,
  stdio: ['ignore', 'ignore', 'inherit'],
});
rmSync(tempDir, { recursive: true, force: true });
if (result.status !== 0) {
  fail('shadcn build가 실패했습니다.');
}

// 결과 검증: 항목마다 JSON이 있고, 의존성이 모두 이 사이트를 가리키는지 확인한다
const built = new Set(readdirSync(OUT_DIR).filter((file) => file.endsWith('.json')));
for (const name of names) {
  if (!built.has(`${name}.json`)) {
    fail(`${name}.json이 생성되지 않았습니다.`);
  }
  const item = JSON.parse(readFileSync(join(OUT_DIR, `${name}.json`), 'utf8'));
  for (const dependency of item.registryDependencies ?? []) {
    if (dependency.startsWith(GITHUB_PREFIX)) {
      fail(`${name}: GitHub 식 의존성이 남아 있습니다 (${dependency})`);
    }
  }
}

say(
  `build-registry: ${names.size}개 항목을 ${siteUrl}/r/ 기준으로 빌드 (의존성 ${rewritten}개를 URL로 변환)`,
);
