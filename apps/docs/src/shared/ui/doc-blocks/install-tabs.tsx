import { ServerCodeBlock } from '@fumadocs/base-ui/components/codeblock.rsc';
import { Tab, Tabs } from '@fumadocs/base-ui/components/tabs';

import { readRepoFile } from '@/shared/lib/repo-file';

import { RepoFile } from './repo-file';

const NAMESPACE = 'minoong/design-monogatari';

type RegistryItem = {
  name: string;
  type: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: { path: string; target?: string }[];
};

/** 레지스트리 target(`@ui/button.tsx`)을 소비자 프로젝트의 shadcn 기본 위치로 바꿔 보여 준다 */
function installedPath(target: string | undefined, fallback: string) {
  return target?.replace(/^@ui\//, 'components/ui/').replace(/^@lib\//, 'lib/') ?? fallback;
}

const PACKAGE_MANAGERS = [
  { name: 'pnpm', run: 'pnpm dlx', add: 'pnpm add' },
  { name: 'npm', run: 'npx', add: 'npm install' },
  { name: 'yarn', run: 'yarn dlx', add: 'yarn add' },
  { name: 'bun', run: 'bunx --bun', add: 'bun add' },
];

function PackageManagerTabs({ commands }: { commands: Record<string, string> }) {
  return (
    <Tabs groupId="package-manager" persist items={PACKAGE_MANAGERS.map((pm) => pm.name)}>
      {PACKAGE_MANAGERS.map((pm) => (
        <Tab key={pm.name} value={pm.name}>
          <ServerCodeBlock code={commands[pm.name] ?? ''} lang="bash" />
        </Tab>
      ))}
    </Tabs>
  );
}

/**
 * 설치 안내. CLI 탭은 shadcn 레지스트리 명령을 패키지 매니저별로, 수동 탭은 `registry.json`에서
 * 읽은 의존성과 파일을 보여 준다. 레지스트리가 유일한 출처라 안내가 설치 결과와 어긋나지 않는다.
 */
export async function InstallTabs({ name }: { name: string }) {
  const registry = JSON.parse((await readRepoFile('registry.json')).code) as {
    items: RegistryItem[];
  };
  const item = registry.items.find((entry) => entry.name === name);
  if (!item) {
    throw new Error(`registry.json 에 없는 항목입니다: ${name}`);
  }

  const dependencies = item.dependencies ?? [];
  // 이 레지스트리 안의 파일 의존성(cn 등). theme 은 CSS 라 별도 안내한다
  const siblings = (item.registryDependencies ?? [])
    .map((id) => registry.items.find((entry) => `${NAMESPACE}/${entry.name}` === id))
    .filter((entry): entry is RegistryItem => entry !== undefined && entry.name !== 'theme');

  return (
    <Tabs items={['CLI', '수동']}>
      <Tab value="CLI">
        <PackageManagerTabs
          commands={Object.fromEntries(
            PACKAGE_MANAGERS.map((pm) => [
              pm.name,
              `${pm.run} shadcn@latest add ${NAMESPACE}/${name}`,
            ]),
          )}
        />
      </Tab>
      <Tab value="수동">
        <div className="flex flex-col gap-2 [&>p]:my-0">
          <p>1. 의존성을 설치해요.</p>
          <PackageManagerTabs
            commands={Object.fromEntries(
              PACKAGE_MANAGERS.map((pm) => [pm.name, `${pm.add} ${dependencies.join(' ')}`]),
            )}
          />
          <p>
            2. 테마 토큰을 설치해요. CSS 변수와 키프레임이 들어 있어서 레지스트리로 받는 쪽이
            안전해요.
          </p>
          <PackageManagerTabs
            commands={Object.fromEntries(
              PACKAGE_MANAGERS.map((pm) => [
                pm.name,
                `${pm.run} shadcn@latest add ${NAMESPACE}/theme`,
              ]),
            )}
          />
          <p>
            3. 아래 파일을 프로젝트에 복사해요. <code>@/lib/utils</code>와 <code>@/ui/…</code>는
            shadcn이 쓰는 별칭이에요.
          </p>
          {[...siblings, item].flatMap((entry) =>
            (entry.files ?? []).map((file) => (
              <RepoFile
                key={file.path}
                path={file.path}
                title={installedPath(file.target, file.path)}
              />
            )),
          )}
        </div>
      </Tab>
    </Tabs>
  );
}
