import './styles/globals.css';

import { RootProvider } from '@fumadocs/base-ui/provider/next';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import type { ReactNode } from 'react';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: { default: 'design-monogatari', template: '%s | design-monogatari' },
  description:
    'Radix, Tailwind, Motion, GSAP으로 만든 디자인 시스템과 shadcn 레지스트리, 그리고 Claude Code 에이전틱 개발 워크플로우 문서',
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    // 폰트 변수는 html 에 둔다. @repo/ui 의 --font-mono 가 :root 에서 var(--font-geist-mono)를 읽기 때문에
    // body 에 두면 code 요소가 변수를 찾지 못해 시스템 모노 폰트로 떨어진다
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-sans">
        {/* 테마는 RootProvider(next-themes)가 html 클래스(light/dark)로 전환한다. @repo/ui 토큰과 같은 방식 */}
        <RootProvider theme={{ attribute: 'class' }}>{children}</RootProvider>
      </body>
    </html>
  );
}
