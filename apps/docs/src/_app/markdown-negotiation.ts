import { isMarkdownPreferred, rewritePath } from 'fumadocs-core/negotiation';
import { type NextRequest, NextResponse } from 'next/server';

// /docs/<경로> 요청이 `Accept: text/markdown`을 먼저 요구하면 HTML 대신 그 페이지의 Markdown 본문(.md 경로와 같은 내용)을 돌려준다.
const { rewrite } = rewritePath('/docs{/*path}', '/llms.mdx/docs{/*path}/content.md');

export function markdownNegotiation(request: NextRequest) {
  if (isMarkdownPreferred(request)) {
    const target = rewrite(request.nextUrl.pathname);
    if (target) {
      return NextResponse.rewrite(new URL(target, request.nextUrl), {
        headers: { Vary: 'Accept' },
      });
    }
  }
  return NextResponse.next();
}
