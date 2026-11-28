// 인트로 프레임 수신기(개발 전용). `/dev/intro-frames` 화면이 그린 프레임을 받아 `public/intro/` 아래에 쓴다.
// 실행: `node apps/web/scripts/intro-frames-sink.mjs` (포트 3999). 절차는 apps/web/AGENTS.md의 Intro 항목에 있다.
import { Buffer } from 'node:buffer';
import { mkdir, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../public/intro');
const PORT = 3999;

const server = createServer(async (request, response) => {
  // 개발 서버 포트는 작업 트리마다 다를 수 있어 localhost 출처만 받는다.
  const origin = request.headers.origin ?? '';
  if (/^http:\/\/localhost:\d+$/.test(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'content-type');
  if (request.method === 'OPTIONS') {
    response.writeHead(204).end();
    return;
  }
  const url = new URL(request.url ?? '/', `http://localhost:${PORT}`);
  const path = url.searchParams.get('path') ?? '';
  const target = normalize(join(ROOT, path));
  if (request.method !== 'POST' || !path.endsWith('.webp') || !target.startsWith(ROOT)) {
    response.writeHead(400).end('bad request');
    return;
  }
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, Buffer.concat(chunks));
  response.writeHead(200).end('ok');
});

server.listen(PORT, () => {
  console.log(`intro frames sink: http://localhost:${PORT} → ${ROOT}`);
});
