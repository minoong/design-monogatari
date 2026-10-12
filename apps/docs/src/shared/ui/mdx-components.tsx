import defaultMdxComponents from '@fumadocs/base-ui/mdx';
import type { MDXComponents } from 'mdx/types';

/** MDX 안에서 쓸 수 있는 컴포넌트. 문서 블록(미리보기, 설치 탭 등)은 이후 PR에서 여기에 추가한다 */
export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...components,
  } satisfies MDXComponents;
}
