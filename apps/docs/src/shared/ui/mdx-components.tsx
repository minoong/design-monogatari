import { Step, Steps } from '@fumadocs/base-ui/components/steps';
import defaultMdxComponents from '@fumadocs/base-ui/mdx';
import type { MDXComponents } from 'mdx/types';

import { ComponentPreview } from './doc-blocks/component-preview';
import { InstallTabs } from './doc-blocks/install-tabs';
import { PropsTable } from './doc-blocks/props-table';
import { RepoFile } from './doc-blocks/repo-file';
import { ColorTokens, Palette, RadiusScale, TypeScale } from './doc-blocks/token-tables';

/** MDX 안에서 쓸 수 있는 컴포넌트. 문서 블록(미리보기, 설치 탭, props 표, 저장소 파일)을 포함한다 */
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ColorTokens,
    ComponentPreview,
    InstallTabs,
    Palette,
    PropsTable,
    RadiusScale,
    RepoFile,
    Step,
    Steps,
    TypeScale,
    ...components,
  } satisfies MDXComponents;
}
