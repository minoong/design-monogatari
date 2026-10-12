import { notFound } from 'next/navigation';

import { getPageMarkdownUrl } from '@/shared/lib/markdown-url';
import { docsLlms, source } from '@/shared/lib/source';

const MARKDOWN = { 'Content-Type': 'text/markdown; charset=utf-8' };

/** /llms.txt: 페이지 트리에서 만든 색인 */
export async function llmsIndexGET() {
  return new Response(await docsLlms.index(), { headers: MARKDOWN });
}

/** /llms-full.txt: 모든 페이지 본문을 이어 붙인 것 */
export async function llmsFullGET() {
  return new Response(await docsLlms.full(), { headers: MARKDOWN });
}

type Params = { params: Promise<{ slug?: string[] }> };

/** /docs/<경로>.md (rewrites 로 이 핸들러에 도달). 끝에 붙은 content.md 를 떼고 페이지를 찾는다 */
export async function markdownPageGET(_request: Request, { params }: Params) {
  const { slug } = await params;
  const page = source.getPage(slug?.slice(0, -1));
  if (!page) {
    notFound();
  }
  return new Response(await docsLlms.page(page), { headers: MARKDOWN });
}

export function markdownStaticParams() {
  return source.getPages().map((page) => ({ slug: getPageMarkdownUrl(page).segments }));
}
