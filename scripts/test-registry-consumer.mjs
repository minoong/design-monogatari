#!/usr/bin/env node
/**
 * 소비자 설치 e2e: 우리 코드가 하나도 없는 새 Next 앱에 레지스트리 항목을 `shadcn add`로 설치하고,
 * 타입 검사, 빌드, 서버 응답까지 확인한다.
 *
 *   node scripts/test-registry-consumer.mjs                    # 호스팅 형태(로컬 서빙)로 전부 설치
 *   node scripts/test-registry-consumer.mjs --source github    # GitHub 형태(minoong/design-monogatari/<항목>)
 *   node scripts/test-registry-consumer.mjs --only button,dialog --keep
 *
 * 왜 필요한가: `pnpm verify`는 모노레포 안에서 컴포넌트가 동작하는지만 본다. 배포 약속은 "shadcn add로
 * 설치하면 된다"인데, 테마에 keyframes가 빠지거나(Button 로딩 점), `bg-overlay`가 생성되지 않거나
 * (Dialog 막), Base UI 프로젝트에서 `asChild`가 깨지는 결함은 소비자 앱에 실제로 설치해 보기 전에는
 * 보이지 않았다.
 *
 * --source hosted  `shadcn build` 결과(apps/docs/public/r)를 로컬에서 서빙해 설치한다. PR의 변경이 그대로
 *                  검증된다. registryDependencies도 같은 서버를 가리키도록 SITE_URL로 바꿔 빌드한다.
 * --source github  GitHub의 기본 브랜치에서 설치한다. 실제 사용자가 하는 방식이다. 의존성(cn, theme 등)의
 *                  ref는 `#ref`를 따라가지 않으므로 PR 브랜치는 검증할 수 없다. main 병합 뒤와 야간에 돈다.
 */

import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const R_DIR = join(ROOT, 'apps/docs/public/r');
const SHADCN = join(ROOT, 'node_modules/.bin/shadcn');
const NAMESPACE = 'minoong/design-monogatari';
/** 소비자 앱 생성기 버전. 외부 도구 업데이트 때문에 PR이 이유 없이 빨개지지 않게 고정한다 */
const CREATE_NEXT_APP = 'create-next-app@16.4.0';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const source = option('--source') ?? 'hosted';
const keep = flag('--keep');
const only = option('--only')?.split(',');
const ref = option('--ref');

if (!['hosted', 'github'].includes(source)) {
  fail(`--source 는 hosted 또는 github 여야 합니다: ${source}`);
}

function say(message) {
  process.stdout.write(`\n=== ${message}\n`);
}

function fail(message) {
  process.stderr.write(`\nregistry-consumer: 실패 - ${message}\n`);
  process.exit(1);
}

/** 명령을 실행한다. 실패하면 어느 단계인지 알리고 종료한다 */
function run(label, command, commandArgs, options = {}) {
  return new Promise((resolve) => {
    say(label);
    const child = spawn(command, commandArgs, {
      cwd: options.cwd ?? ROOT,
      env: { ...process.env, CI: '1', NEXT_TELEMETRY_DISABLED: '1', ...options.env },
      // 대화형 질문이 뜨면 멈추지 않고 실패하도록 입력을 막는다
      stdio: ['ignore', 'inherit', 'inherit'],
    });
    child.on('exit', (code) => {
      if (code !== 0) {
        fail(`${label} (종료 코드 ${code})`);
      }
      resolve();
    });
  });
}

// ---------------------------------------------------------------- 항목 목록

const registry = JSON.parse(readFileSync(join(ROOT, 'registry.json'), 'utf8'));
const allNames = registry.items.map((item) => item.name);
const names = only ?? allNames;
for (const name of names) {
  if (!allNames.includes(name)) {
    fail(`registry.json 에 없는 항목입니다: ${name}`);
  }
}

// ---------------------------------------------------------------- 호스팅 서버 (hosted)

let server;
let baseUrl;

async function startServer() {
  const types = { '.json': 'application/json' };
  server = createServer((request, response) => {
    // 요청 경로로 R_DIR 밖을 읽지 못하게 파일 이름만 쓴다
    const file = join(
      R_DIR,
      (request.url ?? '')
        .split('?')[0]
        .replace(/^\/r\//, '')
        .replace(/[^\w.-]/g, ''),
    );
    if (!existsSync(file) || !statSync(file).isFile()) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, { 'content-type': types[extname(file)] ?? 'text/plain' });
    response.end(readFileSync(file));
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
}

// ---------------------------------------------------------------- 본 작업

const work = mkdtempSync(join(tmpdir(), 'dm-consumer-'));
const app = join(work, 'app');

async function cleanup() {
  server?.close();
  if (keep) {
    say(`임시 앱을 남겼습니다: ${app}`);
  } else {
    rmSync(work, { recursive: true, force: true });
  }
}

process.on('exit', () => {
  server?.close();
  if (!keep) {
    rmSync(work, { recursive: true, force: true });
  }
});

if (!existsSync(SHADCN)) {
  fail('shadcn CLI가 없습니다. `pnpm install` 후 다시 실행하십시오.');
}

let addresses;
if (source === 'hosted') {
  await startServer();
  await run(
    '레지스트리 빌드 (SITE_URL=로컬 서버)',
    'node',
    [join(ROOT, 'scripts/build-registry.mjs')],
    {
      env: { SITE_URL: baseUrl },
    },
  );
  const built = new Set(readdirSync(R_DIR));
  for (const name of names) {
    if (!built.has(`${name}.json`)) {
      fail(`${name}.json 이 빌드 결과에 없습니다`);
    }
  }
  addresses = names.map((name) => `${baseUrl}/r/${name}.json`);
} else {
  addresses = names.map((name) => `${NAMESPACE}/${name}${ref ? `#${ref}` : ''}`);
}

await run('새 Next 앱 생성', 'pnpm', [
  'dlx',
  CREATE_NEXT_APP,
  app,
  '--ts',
  '--tailwind',
  '--eslint',
  '--app',
  '--no-src-dir',
  '--import-alias',
  '@/*',
  '--use-pnpm',
  '--yes',
  '--disable-git',
]);

// Radix 판으로 초기화한다. 기본값(Base UI)에서는 CLI가 asChild 를 render= 로 바꿔 Dialog 가 깨진다
await run('shadcn init (Radix)', SHADCN, ['init', '-b', 'radix', '-p', 'nova', '-y'], { cwd: app });

const components = JSON.parse(readFileSync(join(app, 'components.json'), 'utf8'));
if (/^base-/.test(components.style ?? '')) {
  fail(`Radix 가 아니라 ${components.style} 로 초기화됐습니다`);
}

await run(`shadcn add (${source}, ${names.length}개)`, SHADCN, ['add', ...addresses, '-y', '-o'], {
  cwd: app,
});

// ---------------------------------------------------------------- 설치 결과 확인

say('설치된 파일 확인');
for (const name of names) {
  const item = registry.items.find((entry) => entry.name === name);
  if (item.type !== 'registry:ui') {
    continue;
  }
  const installed = join(app, 'components/ui', `${name}.tsx`);
  if (!existsSync(installed)) {
    fail(`components/ui/${name}.tsx 가 설치되지 않았습니다`);
  }
}
if (!existsSync(join(app, 'lib/utils.ts'))) {
  fail('lib/utils.ts (cn) 가 설치되지 않았습니다');
}

// 설치된 컴포넌트를 실제로 가져다 쓰는 페이지. 가져오지 않으면 번들에 안 들어가 빌드가 아무것도 검증하지 못한다
const isUi = (name) => registry.items.find((entry) => entry.name === name)?.type === 'registry:ui';
const fullInstall = names.filter(isUi).length === allNames.filter(isUi).length;
const page = `import { AnimatedAmount } from '@/components/ui/animated-amount';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Page() {
  return (
    <main>
      <Button variant="primary" loading>consumer-button</Button>
      <IconButton aria-label="consumer-icon-button">+</IconButton>
      <Badge>consumer-badge</Badge>
      <Card><CardHeader><CardTitle>consumer-card</CardTitle><CardDescription>d</CardDescription></CardHeader></Card>
      <Field><FieldLabel htmlFor="c">consumer-field</FieldLabel><Input id="c" /><FieldError id="e">err</FieldError></Field>
      <Label htmlFor="c">consumer-label</Label>
      <AnimatedAmount value={1000} />
      <Dialog>
        <DialogTrigger asChild><Button>consumer-dialog-trigger</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>t</DialogTitle><DialogDescription>d</DialogDescription></DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
}
`;
if (fullInstall) {
  writeFileSync(join(app, 'app/page.tsx'), page);
} else {
  say('일부 항목만 설치해서 스모크 페이지와 CSS, 서버 확인은 건너뜁니다');
}

await run('tsc --noEmit', 'pnpm', ['exec', 'tsc', '--noEmit'], { cwd: app });
await run('next build', 'pnpm', ['exec', 'next', 'build'], { cwd: app });

// ---------------------------------------------------------------- 컴파일된 CSS 확인

say('컴파일된 CSS 확인');
function cssFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? cssFiles(path) : path.endsWith('.css') ? [path] : [];
  });
}
const css = cssFiles(join(app, '.next/static'))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');
const required = [
  [
    '.bg-overlay',
    'Dialog 막(bg-overlay)이 생성되지 않았습니다. color-mix 토큰이 theme 에서 빠졌을 수 있습니다',
  ],
  [
    'animate-button-loader-dot',
    'Button 로딩 점 애니메이션이 없습니다. theme 의 --animate-* 가 빠졌을 수 있습니다',
  ],
  ['@keyframes button-loader-dot', 'button-loader-dot keyframes 가 없습니다'],
  ['.bg-primary', '시맨틱 색 유틸리티(bg-primary)가 생성되지 않았습니다'],
];
if (fullInstall) {
  for (const [needle, message] of required) {
    if (!css.includes(needle)) {
      fail(message);
    }
  }
  process.stdout.write('  CSS 확인 통과\n');
}

// ---------------------------------------------------------------- 서버 응답 확인

if (fullInstall) {
  say('next start 응답 확인');
  const port = 30000 + Math.floor(Math.random() * 10000);
  const child = spawn('pnpm', ['exec', 'next', 'start', '-p', String(port)], {
    cwd: app,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  let html = '';
  for (let attempt = 0; attempt < 30 && !html; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) {
        html = await response.text();
      }
    } catch {
      // 아직 기동 중
    }
  }
  child.kill();
  if (!html) {
    fail('next start 가 응답하지 않았습니다');
  }
  for (const marker of ['consumer-button', 'consumer-card', 'consumer-field', 'consumer-badge']) {
    if (!html.includes(marker)) {
      fail(`렌더된 HTML 에 ${marker} 가 없습니다`);
    }
  }
  if (!html.includes('aria-busy="true"')) {
    fail('Button loading 상태의 aria-busy 가 렌더되지 않았습니다');
  }
  process.stdout.write('  서버 응답 확인 통과\n');
}

await cleanup();
say(
  `통과: ${names.length}개 항목을 ${source} 형태로 새 앱에 설치하고 타입 검사, 빌드${fullInstall ? ', 서버 응답' : ''}까지 확인했습니다`,
);
