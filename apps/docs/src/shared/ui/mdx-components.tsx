import defaultMdxComponents from '@fumadocs/base-ui/mdx';
import { cn } from '@repo/ui/cn';
import type { MDXComponents } from 'mdx/types';
import type { ComponentProps } from 'react';

import { ComponentPreview } from './doc-blocks/component-preview';
import { InstallTabs } from './doc-blocks/install-tabs';
import { PropsTable } from './doc-blocks/props-table';
import { RepoFile } from './doc-blocks/repo-file';
import { ColorTokens, Palette, RadiusScale, TypeScale } from './doc-blocks/token-tables';
import { SectionIcon } from './section-icons';

const FumadocsCard = defaultMdxComponents.Card;

/** 링크 카드의 키보드 포커스를 브라우저 기본 링 대신 문서 테마의 링 색으로 보인다. 카드 설명 안에 링크를 넣지 않는다(카드가 이미 하나의 링크라 `<a>`가 중첩된다). */
function Card({ className, ...props }: ComponentProps<typeof FumadocsCard>) {
  return (
    <FumadocsCard
      className={cn(
        'focus-visible:outline-fd-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid',
        className,
      )}
      {...props}
    />
  );
}

/** MDX 안에서 쓸 수 있는 컴포넌트. 문서 블록(미리보기, 설치 탭, props 표, 저장소 파일)을 포함한다 */
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Card,
    ColorTokens,
    ComponentPreview,
    InstallTabs,
    Palette,
    PropsTable,
    RadiusScale,
    RepoFile,
    SectionIcon,
    TypeScale,
    ...components,
  } satisfies MDXComponents;
}
