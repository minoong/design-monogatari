/** @type {import('next').NextConfig} */
const nextConfig = {
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
