import { notFound } from 'next/navigation';

import { IntroFramesApp } from './intro-frames-app';

/** 인트로 프레임을 미리 렌더하는 개발 전용 화면. 배포 빌드에서는 없는 주소다. */
export function IntroFramesPage() {
  // NODE_ENV는 Next가 빌드 모드로 정하는 값이라 turbo 캐시 입력(환경 변수)이 아니다.
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.NODE_ENV === 'production') notFound();
  return <IntroFramesApp />;
}
