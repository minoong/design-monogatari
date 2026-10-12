import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async rewrites() {
    return [
      // /docs/<경로>.md 로 페이지의 Markdown 본문을 에이전트와 사람이 읽을 수 있게 한다
      { source: '/docs/:path*.md', destination: '/llms.mdx/docs/:path*/content.md' },
    ];
  },
  async headers() {
    return [
      {
        // 호스팅한 shadcn 레지스트리(public/r)를 브라우저 도구에서도 읽을 수 있게 한다
        source: '/r/:path*.json',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=3600' },
        ],
      },
    ];
  },
};

export default withMDX(config);
