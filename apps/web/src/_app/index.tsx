import './styles/globals.css';

import { TooltipProvider } from '@repo/ui/tooltip';
import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { ThemeProvider } from './ui/theme-provider';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'X5 견적 (비공식 포트폴리오)',
  description:
    '단계별로 고르면 규칙과 가격이 바로 반영되는 가상의 X5 견적입니다. BMW와 무관합니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* 툴팁의 열림 지연은 앱 전체가 같다(마우스를 올리면 0.4초 뒤, 옆으로 옮기면 바로). */}
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
