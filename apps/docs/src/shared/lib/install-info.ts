import { readRepoFile } from './repo-file';

export const NAMESPACE = 'minoong/design-monogatari';

export const PACKAGE_MANAGERS = [
  { name: 'pnpm', run: 'pnpm dlx', add: 'pnpm add' },
  { name: 'npm', run: 'npx', add: 'npm install' },
  { name: 'yarn', run: 'yarn dlx', add: 'yarn add' },
  { name: 'bun', run: 'bunx --bun', add: 'bun add' },
] as const;

type RegistryItem = {
  name: string;
  type: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: { path: string; target?: string }[];
};

export type InstallInfo = {
  dependencies: string[];
  /** 테마 토큰(CSS 변수, 키프레임)이 필요한 항목인가. cn 같은 유틸리티는 필요 없다 */
  needsTheme: boolean;
  /** 수동 설치 때 복사할 파일 (이 레지스트리 안의 파일 의존성 + 항목 자신) */
  files: { path: string; title: string }[];
};

/** 레지스트리 target(`@ui/button.tsx`)을 소비자 프로젝트의 shadcn 기본 위치로 바꿔 보여 준다 */
function installedPath(target: string | undefined, fallback: string) {
  return target?.replace(/^@ui\//, 'components/ui/').replace(/^@lib\//, 'lib/') ?? fallback;
}

/** `pnpm dlx shadcn@latest add minoong/design-monogatari/button` 처럼 패키지 매니저별 명령 */
export function addCommand(pm: (typeof PACKAGE_MANAGERS)[number], name: string) {
  return `${pm.run} shadcn@latest add ${NAMESPACE}/${name}`;
}

/**
 * 설치 안내에 필요한 정보를 `registry.json`에서 읽는다. 레지스트리가 유일한 출처라
 * 안내가 실제 설치 결과와 어긋나지 않는다. 페이지(InstallTabs)와 Markdown 출력이 함께 쓴다.
 */
export async function getInstallInfo(name: string): Promise<InstallInfo> {
  const registry = JSON.parse((await readRepoFile('registry.json')).code) as {
    items: RegistryItem[];
  };
  const item = registry.items.find((entry) => entry.name === name);
  if (!item) {
    throw new Error(`registry.json 에 없는 항목입니다: ${name}`);
  }

  // 이 레지스트리 안의 파일 의존성(cn 등). theme 은 CSS 라 따로 안내한다
  const siblings = (item.registryDependencies ?? [])
    .map((id) => registry.items.find((entry) => `${NAMESPACE}/${entry.name}` === id))
    .filter((entry): entry is RegistryItem => entry !== undefined && entry.name !== 'theme');

  return {
    dependencies: item.dependencies ?? [],
    needsTheme: (item.registryDependencies ?? []).includes(`${NAMESPACE}/theme`),
    files: [...siblings, item].flatMap((entry) =>
      (entry.files ?? []).map((file) => ({
        path: file.path,
        title: installedPath(file.target, file.path),
      })),
    ),
  };
}
