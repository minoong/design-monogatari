import { HomeLayout } from '@fumadocs/base-ui/layouts/home';
import { Button } from '@repo/ui/button';
import Link from 'next/link';

import { baseOptions } from '@/shared/lib/layout-options';

import { HeroEstimate } from './hero-estimate';
import { HomeFooter, HomeSections } from './home-sections';

/** 소개(랜딩) 페이지. 문서가 아니라 디자인 시스템을 한눈에 보여 주고 각 문서로 보낸다. */
export function HomePage() {
  return (
    <HomeLayout
      {...baseOptions()}
      links={[
        { text: '문서', url: '/docs', active: 'nested-url' },
        { text: '컴포넌트', url: '/docs/components/button', active: 'nested-url' },
        { text: 'AI 워크플로', url: '/docs/ai-workflow', active: 'nested-url' },
      ]}
    >
      <div className="flex flex-col break-keep">
        <section className="mx-auto w-full max-w-6xl px-4 pt-14 md:px-6 md:pt-24">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="border-primary/40 text-primary m-0 rounded-full border px-3 py-1 font-mono text-xs">
              자동차 견적 UI를 위한 디자인 시스템
            </p>
            <h1 className="m-0 mt-6 text-4xl font-medium tracking-tight text-balance md:text-6xl">
              차분한 화면, <span className="text-primary">정확한</span> 견적.
            </h1>
            <p className="text-muted-foreground mt-6 mb-0 text-base leading-7 text-pretty md:text-lg">
              Radix, Tailwind CSS v4, Motion으로 만든 디자인 시스템입니다. 서른두 개 컴포넌트를
              shadcn 명령 한 줄로 프로젝트에 가져가 쓰십시오.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild radius="pill" variant="primary">
                <Link href="/docs">시작하기</Link>
              </Button>
              <Button asChild radius="pill" variant="secondary">
                <Link href="/docs/components/button">컴포넌트 보기</Link>
              </Button>
            </div>
          </div>
          <div className="border-border relative mt-14 overflow-hidden rounded-2xl border bg-[radial-gradient(120%_90%_at_50%_0%,color-mix(in_oklab,var(--color-primary)_20%,transparent),transparent_70%)] p-4 md:p-10">
            {/* 장식: 아주 옅은 격자가 위쪽에서 아래로 사라진다. 클릭을 가로채지 않고 낭독기에는 숨긴다. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--color-foreground)_7%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--color-foreground)_7%,transparent)_1px,transparent_1px)] mask-[radial-gradient(80%_70%_at_50%_0%,black,transparent)] bg-size-[32px_32px]"
            />
            <div className="relative">
              <HeroEstimate />
            </div>
          </div>
          <p className="text-muted-foreground mt-3 mb-0 text-center text-xs">
            위 카드는 실제 컴포넌트입니다. 눌러 보십시오. 가상의 견적 데모이며 BMW와 무관합니다.
          </p>
        </section>

        <HomeSections />
        <HomeFooter />
      </div>
    </HomeLayout>
  );
}
