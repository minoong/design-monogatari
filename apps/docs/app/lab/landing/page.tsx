import type { Metadata } from 'next';

export { HomeLabPage as default } from '@/_pages/home';

/** 실험 화면이라 검색 엔진 색인에서 뺀다 */
export const metadata: Metadata = {
  title: '랜딩 연출 프로토타입',
  robots: { index: false, follow: false },
};
