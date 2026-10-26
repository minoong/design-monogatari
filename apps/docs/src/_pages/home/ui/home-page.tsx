import { HomeLayout } from '@fumadocs/base-ui/layouts/home';
import { Button } from '@repo/ui/button';
import Link from 'next/link';

import { baseOptions } from '@/shared/lib/layout-options';

import { Gallery } from './gallery';
import { HeroEstimate } from './hero-estimate';
import { InstallSection } from './install-section';
import { MotionSection } from './motion-section';
import { Section } from './section';
import { TokenSection } from './token-section';

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
      <div className="flex flex-col">
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
            <HeroEstimate />
          </div>
          <p className="text-muted-foreground mt-3 mb-0 text-center text-xs">
            위 카드는 실제 컴포넌트입니다. 눌러 보십시오. 가상의 견적 데모이며 BMW와 무관합니다.
          </p>
        </section>

        <Section
          description="견적 화면에서 쓰는 컴포넌트를 눌러 볼 수 있습니다. 모두 같은 토큰과 같은 움직임 규칙을 따릅니다."
          eyebrow="컴포넌트"
          id="components"
          title="고르는 일을 위한 컴포넌트"
        >
          <Gallery />
          <div className="mt-8">
            <Button asChild radius="pill" variant="secondary">
              <Link href="/docs/components/button">전체 컴포넌트 보기</Link>
            </Button>
          </div>
        </Section>

        <Section
          description="색, 글자 크기, 모서리는 토큰으로 정해져 있습니다. 화면의 값은 레지스트리의 테마에서 읽어 와서 문서와 어긋나지 않습니다."
          eyebrow="토큰"
          id="tokens"
          title="조용한 크롬, 하나의 강조색"
        >
          <TokenSection />
        </Section>

        <Section
          description="움직임은 상태가 바뀌는 순간에만 쓰고, 투명도 없이 선명한 채로 바뀝니다. 감소 모션 설정을 따릅니다."
          eyebrow="모션"
          id="motion"
          title="바뀌는 순간을 알리는 움직임"
        >
          <MotionSection />
        </Section>

        <Section
          description="컴포넌트는 shadcn 레지스트리로 배포합니다. 설치한 뒤에는 프로젝트의 파일입니다."
          eyebrow="설치"
          id="install"
          title="명령 두 줄로 시작합니다"
        >
          <InstallSection />
        </Section>

        <footer className="border-border mt-6 border-t">
          <div className="text-muted-foreground mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm md:flex-row md:items-center md:justify-between md:px-6">
            <p className="m-0">design-monogatari · 비공식 포트폴리오이며 BMW와 무관합니다.</p>
            <nav aria-label="바닥글" className="flex flex-wrap gap-4">
              <Link href="/docs">문서</Link>
              <Link href="/docs/ai-workflow">AI 워크플로</Link>
              <Link href="/llms.txt">llms.txt</Link>
              <a href="https://github.com/minoong/design-monogatari">GitHub</a>
            </nav>
          </div>
        </footer>
      </div>
    </HomeLayout>
  );
}
