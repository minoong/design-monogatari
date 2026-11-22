import { Button } from '@repo/ui/button';
import Link from 'next/link';

import { Gallery } from './gallery';
import { InstallSection } from './install-section';
import { MotionSection } from './motion-section';
import { Section } from './section';
import { TokenSection } from './token-section';

/** 히어로 아래의 구역들. `reveal`이면 스크롤로 들어올 때 차례로 올라온다(CSS 스크롤 타임라인). */
export function HomeSections({ reveal = false }: { reveal?: boolean }) {
  return (
    <>
      <Section
        description="견적 화면에서 쓰는 컴포넌트를 눌러 볼 수 있습니다. 모두 같은 토큰과 같은 움직임 규칙을 따릅니다."
        eyebrow="컴포넌트"
        id="components"
        reveal={reveal}
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
        reveal={reveal}
        title="조용한 크롬, 하나의 강조색"
      >
        <TokenSection />
      </Section>

      <Section
        description="움직임은 상태가 바뀌는 순간에만 쓰고, 투명도 없이 선명한 채로 바뀝니다. 감소 모션 설정을 따릅니다."
        eyebrow="모션"
        id="motion"
        reveal={reveal}
        title="바뀌는 순간을 알리는 움직임"
      >
        <MotionSection />
      </Section>

      <Section
        description="컴포넌트는 shadcn 레지스트리로 배포합니다. 설치한 뒤에는 프로젝트의 파일입니다."
        eyebrow="설치"
        id="install"
        reveal={reveal}
        title="명령 두 줄로 시작합니다"
      >
        <InstallSection />
      </Section>
    </>
  );
}

export function HomeFooter() {
  return (
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
  );
}
