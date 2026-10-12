import { ServerCodeBlock } from '@fumadocs/base-ui/components/codeblock.rsc';
import { Tab, Tabs } from '@fumadocs/base-ui/components/tabs';

import { addCommand, getInstallInfo, PACKAGE_MANAGERS } from '@/shared/lib/install-info';

import { RepoFile } from './repo-file';

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

/** 설치 안내. CLI 탭은 shadcn 레지스트리 명령을, 수동 탭은 의존성과 복사할 파일을 보여 준다 */
export async function InstallTabs({ name }: { name: string }) {
  const { dependencies, needsTheme, files } = await getInstallInfo(name);

  return (
    <Tabs items={['CLI', '수동']}>
      <Tab value="CLI">
        <PackageManagerTabs
          commands={Object.fromEntries(
            PACKAGE_MANAGERS.map((pm) => [pm.name, addCommand(pm, name)]),
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
          {needsTheme ? (
            <>
              <p>
                2. 테마 토큰을 설치해요. CSS 변수와 키프레임이 들어 있어서 레지스트리로 받는 쪽이
                안전해요.
              </p>
              <PackageManagerTabs
                commands={Object.fromEntries(
                  PACKAGE_MANAGERS.map((pm) => [pm.name, addCommand(pm, 'theme')]),
                )}
              />
            </>
          ) : null}
          <p>
            {needsTheme ? 3 : 2}. 아래 파일을 프로젝트에 복사해요. <code>@/lib/utils</code>와{' '}
            <code>@/ui/…</code>는 shadcn이 쓰는 별칭이에요.
          </p>
          {files.map((file) => (
            <RepoFile key={file.path} path={file.path} title={file.title} />
          ))}
        </div>
      </Tab>
    </Tabs>
  );
}
