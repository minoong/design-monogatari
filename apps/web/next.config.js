/** @type {import('next').NextConfig} */
/**
 * 견적 화면은 `/estimate`로 옮겼고 `/`는 인트로다. 예전에 공유한 `/?c=…` 링크가 계속 열리도록, 견적을 담은 쿼리
 * (`v` `c` `p` `a` `r` `t` `step`)가 하나라도 있으면 `/estimate`로 보낸다. 쿼리는 그대로 넘어간다.
 * 인트로를 정적으로 두려고 페이지가 아니라 설정에서 처리한다.
 */
const ESTIMATE_QUERY_KEYS = ['v', 'c', 'p', 'a', 'r', 't', 'step'];

const nextConfig = {
  async redirects() {
    return ESTIMATE_QUERY_KEYS.map((key) => ({
      source: '/',
      has: [{ type: 'query', key }],
      destination: '/estimate',
      permanent: false,
    }));
  },
  async headers() {
    return [
      {
        // 3D 모델과 환경맵은 파일 이름에 해시가 없어서 영구 캐시는 쓰지 않는다. 하루는 다시 묻지 않고 쓰고,
        // 그 뒤 일주일은 캐시를 보여 주며 뒤에서 새로 받아 온다. 모델을 바꾸면 이름도 바꿔 올리십시오.
        source: '/models/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
