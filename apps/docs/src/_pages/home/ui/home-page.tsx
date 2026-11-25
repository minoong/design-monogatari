import { HomeLayout } from '@fumadocs/base-ui/layouts/home';
import { Button } from '@repo/ui/button';
import Link from 'next/link';

import { baseOptions } from '@/shared/lib/layout-options';

import { Gallery } from './gallery';
import { HomeFooter } from './home-footer';
import { LandingHero } from './landing/landing-hero';
import { LandingRail } from './landing/landing-rail';
import { Accent, LandingSection } from './landing/landing-section';
import { SceneDrive } from './landing/scene-drive';
import { SceneInstall } from './landing/scene-install';
import { SceneMotion } from './landing/scene-motion';
import { ScenePaint } from './landing/scene-paint';
import { SceneTokens } from './landing/scene-tokens';
import { MotionSection } from './motion-section';
import { TokenSection } from './token-section';

/**
 * 소개(랜딩) 페이지. fumadocs.dev처럼 구역마다 전용 스테이지(도트 장면 + 직접 눌러 볼 수 있는 조작)를 두고,
 * 맨 아래 고정 막대로 구역을 오간다. 문서가 아니라 디자인 시스템을 한눈에 보여 주고 각 문서로 보낸다.
 */
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
      <div className="flex flex-col pb-9 break-keep">
        <LandingHero />

        <LandingSection
          description="OptionRow와 ColorSwatchGroup 같은 컴포넌트는 고르는 일에만 집중합니다. 색은 호출하는 쪽이 넘기고, 화면은 그 값을 따라갑니다."
          id="components"
          side="right"
          title={
            <>
              색을 고르면,
              <br />
              <Accent>차가 바뀝니다.</Accent>
            </>
          }
        >
          <ScenePaint />
          <Gallery />
          <div>
            <Button asChild radius="pill" variant="secondary">
              <Link href="/docs/components/button">전체 컴포넌트 보기</Link>
            </Button>
          </div>
        </LandingSection>

        <LandingSection
          description="색, 글자 크기, 모서리는 토큰으로만 정합니다. 아래 두 카드는 같은 구성에 테마 클래스만 다르고, SUV 점도 각자의 토큰 색으로 찍힙니다."
          id="tokens"
          side="left"
          title={
            <>
              라이트도 다크도,
              <br />
              <Accent>같은 토큰</Accent>입니다.
            </>
          }
        >
          <SceneTokens />
          <TokenSection />
        </LandingSection>

        <LandingSection
          description="랜딩에서만 쓰는 스크롤 연출입니다. 견적 화면의 컴포넌트는 선택·진입 같은 상태가 바뀔 때만 움직이고, 감소 모션 설정을 따릅니다."
          id="motion"
          side="right"
          title={
            <>
              상태가 바뀔 때만,
              <br />
              <Accent>움직입니다.</Accent>
            </>
          }
        >
          <SceneMotion />
          <MotionSection />
        </LandingSection>

        <LandingSection
          description="컴포넌트는 shadcn 레지스트리로 배포합니다. 설치한 뒤에는 프로젝트의 파일이므로 자유롭게 고칠 수 있습니다."
          id="install"
          side="left"
          title={
            <>
              명령 두 줄이면,
              <br />
              <Accent>내 프로젝트의 파일</Accent>입니다.
            </>
          }
        >
          <SceneInstall />
        </LandingSection>

        <SceneDrive />

        <HomeFooter />
      </div>
      <LandingRail />
    </HomeLayout>
  );
}
