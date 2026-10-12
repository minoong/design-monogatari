import type { InferPageType } from 'fumadocs-core/source';

import type { source } from './source';

/** 페이지 Markdown 본문을 돌려주는 내부 라우트. next.config 의 rewrites 가 /docs/<경로>.md 를 여기로 보낸다 */
export const docsContentRoute = '/llms.mdx/docs';

export function getPageMarkdownUrl(page: InferPageType<typeof source>) {
  const segments = [...page.slugs, 'content.md'];
  return { segments, url: `${docsContentRoute}/${segments.join('/')}` };
}
