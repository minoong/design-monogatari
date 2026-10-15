import { markdownNegotiation } from '@/_app/markdown-negotiation';

// Next의 파일 규약상 app/ 옆(앱 루트)에 있어야 한다. 구현은 src/_app 에 있다.
export const proxy = markdownNegotiation;

export const config = {
  matcher: '/docs/:path*',
};
