import { IntroApp } from './intro-app';

/**
 * 견적 앱의 첫 화면. 정적으로 그려지고, 차량(3D)은 브라우저에서만 불러온다.
 * 예전 `/?c=…` 공유 링크는 `next.config.js`의 리다이렉트가 `/estimate`로 보낸다.
 */
export function IntroPage() {
  return <IntroApp />;
}
