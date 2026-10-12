import { readFile } from 'node:fs/promises';
import path from 'node:path';

/** 저장소 루트. docs 앱은 항상 apps/docs 에서 실행된다 (pnpm --filter, turbo) */
const REPO_ROOT = path.resolve(process.cwd(), '../..');

const LANGUAGES: Record<string, string> = {
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.js': 'js',
  '.mjs': 'js',
  '.json': 'json',
  '.css': 'css',
  '.md': 'md',
  '.mdx': 'mdx',
  '.yml': 'yaml',
  '.yaml': 'yaml',
  '.sh': 'bash',
};

export type RepoFileContent = { code: string; lang: string };

/**
 * 저장소 파일을 빌드 시 읽는다. 문서의 코드 조각이 실제 코드와 어긋나지 않게 하려는 것이라
 * 페이지에 코드를 복사해 두지 않는다. 저장소 밖 경로는 거부한다.
 * `lines`는 "12-30" 또는 "12"(1-기준, 양끝 포함).
 */
export async function readRepoFile(file: string, lines?: string): Promise<RepoFileContent> {
  // 문서 페이지는 모두 빌드 때 정적으로 만들어지므로(generateStaticParams) 런타임 추적이 필요 없다.
  // turbopackIgnore 가 없으면 프로젝트 전체가 서버 번들 추적 대상이 된다
  const resolved = path.resolve(/*turbopackIgnore: true*/ REPO_ROOT, file);
  const relative = path.relative(REPO_ROOT, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`저장소 밖의 파일은 읽을 수 없습니다: ${file}`);
  }

  let code = (await readFile(resolved, 'utf8')).replace(/\n$/, '');
  if (lines) {
    const match = /^(\d+)(?:-(\d+))?$/.exec(lines);
    if (!match) {
      throw new Error(`lines 형식이 올바르지 않습니다 (예: "12-30"): ${lines}`);
    }
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    code = code
      .split('\n')
      .slice(start - 1, end)
      .join('\n');
  }

  return { code, lang: LANGUAGES[path.extname(resolved)] ?? 'text' };
}

/**
 * 예시 파일의 표시용 소스. 포털로 열리는 요소(DialogContent 등)는 프리뷰 영역 밖에 그려져서
 * 예시 파일에 문서 전용 `data-ds-preview` 속성이 들어가는데, 사용자가 복사해 갈 코드에는
 * 없어야 하므로 코드 탭과 Markdown 출력에서는 뺀다.
 */
export async function readExampleSource(name: string): Promise<RepoFileContent> {
  const file = await readRepoFile(`apps/docs/src/_examples/${name}.tsx`);
  return { ...file, code: file.code.replace(/\s+data-ds-preview(?=[\s/>])/g, '') };
}
