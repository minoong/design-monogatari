import { ServerCodeBlock } from '@fumadocs/base-ui/components/codeblock.rsc';
import { Tab, Tabs } from '@fumadocs/base-ui/components/tabs';
import type { ComponentType } from 'react';

import { readExampleSource } from '@/shared/lib/repo-file';

const EXAMPLE_NAME = /^[a-z0-9-]+\/[a-z0-9-]+$/;

type ComponentPreviewProps = {
  /** `src/_examples/<컴포넌트>/<이름>.tsx` 의 `<컴포넌트>/<이름>` */
  name: string;
};

/**
 * 예시 파일 하나를 라이브로 렌더하고, 같은 파일을 코드 탭에 보여 준다.
 * 예시 파일이 유일한 출처라 화면과 코드가 어긋날 수 없다.
 */
export async function ComponentPreview({ name }: ComponentPreviewProps) {
  if (!EXAMPLE_NAME.test(name)) {
    throw new Error(`예시 이름 형식이 올바르지 않습니다 (예: "button/variants"): ${name}`);
  }

  const { default: Example } = (await import(`@/_examples/${name}`)) as {
    default: ComponentType;
  };
  const source = await readExampleSource(name);

  return (
    <Tabs items={['미리보기', '코드']}>
      <Tab value="미리보기">
        {/* data-ds-preview: 문서 크롬의 반경 보정(globals.css)에서 제외해 컴포넌트 본래 모양을 보여 준다 */}
        <div
          data-ds-preview
          // not-prose 는 typography 플러그인의 클래스라 tailwindcss 린트가 모른다. 문서 본문의 p, ul 여백이 프리뷰로 새는 것을 막는다
          // eslint-disable-next-line tailwindcss/no-custom-classname
          className="not-prose bg-background text-foreground flex min-h-40 flex-wrap items-center justify-center gap-3 rounded-md p-6"
        >
          <Example />
        </div>
      </Tab>
      <Tab value="코드">
        <ServerCodeBlock
          code={source.code}
          lang={source.lang}
          codeblock={{ title: `${name}.tsx` }}
        />
      </Tab>
    </Tabs>
  );
}
