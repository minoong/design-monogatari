'use client';

import { cn } from '@repo/ui/cn';
import type { CameraViewId } from '@repo/vehicle-3d/views';
import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

/**
 * 인트로의 구역. 순서가 곧 스크롤 순서이고, `view`는 그 구역에서 차량이 보이는 시점이다(구역이 바뀔 때만 카메라가 옮겨 간다).
 * `label`은 하단 구역 막대에 보이는 짧은 이름이다.
 */
export const INTRO_SECTIONS = [
  { id: 'intro-hero', label: '시작', view: 'exterior' },
  { id: 'intro-trim', label: '트림', view: 'exterior' },
  { id: 'intro-color', label: '색상', view: 'exterior' },
  { id: 'intro-wheel', label: '휠', view: 'wheel' },
  { id: 'intro-interior', label: '내장', view: 'dashboard' },
  { id: 'intro-price', label: '가격', view: 'exterior' },
  { id: 'intro-start', label: '출발', view: 'exterior' },
] as const satisfies readonly { id: string; label: string; view: CameraViewId }[];

export type IntroSectionId = (typeof INTRO_SECTIONS)[number]['id'];

/** 등장 순서(CSS 변수). 클수록 늦게 올라온다. */
function order(index: number): CSSProperties {
  return { '--ip-i': index } as CSSProperties;
}

/** CSS 변수 묶음 */
export function vars(values: Record<string, string | number>): CSSProperties {
  return values as CSSProperties;
}

/** 마스크 안에서 올라오는 제목 줄의 바깥. 글자 아래쪽이 잘리지 않게 위아래로 조금 여유를 둔다. */
export function Mask({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn('my-[-0.1em] block overflow-clip py-[0.1em]', className)}>{children}</span>
  );
}

/** 층이 공유하는 안쪽 폭과 여백. */
const LAYER =
  'pointer-events-none z-20 mx-auto flex w-full max-w-[96rem] flex-col px-5 break-keep lg:px-12';

/**
 * 구역의 바깥틀. 넓은 화면에서는 화면 전체가 한 장면이고 가운데는 비워 둔다(뒤에 고정된 차량이 보인다). 좁은 화면에서는 위에
 * 고정된 차량 칸 아래로 글이 흐른다. 구역 자체와 두 겹은 마우스를 통과시켜 빈 곳에서 차량을 끌어 돌릴 수 있고, 안의 글과 조작
 * (`SceneBlock`)만 마우스를 받는다.
 *
 * 두 겹: `text`(글 겹, 왼쪽 위)과 `controls`(조작 겹, 오른쪽 아래). 둘 다 차량 캔버스(z-10)보다 위(z-20)에 있어야 클릭이 닿는다.
 * 글은 테마의 글자색에 배경색 후광(`text-shadow`)을 둬서 차체, 헤드램프, 차창, 대시보드처럼 밝기가 섞인 장면 위에서도 읽히게 한다
 * (`mix-blend-difference`는 단색 차체 위에서만 읽혀서 쓰지 않는다: 중간 밝기에서 글자가 흐려지거나 색이 물든다).
 * 조작 겹은 후광 대신 반투명 패널(`SceneControls`)을 쓴다. */
export function SceneFrame({
  id,
  text,
  controls,
}: {
  id: IntroSectionId;
  text: ReactNode;
  controls?: ReactNode;
}) {
  return (
    <section
      id={id}
      data-intro-section
      tabIndex={-1}
      className="sc pointer-events-none relative outline-none"
    >
      <div
        className={cn(
          LAYER,
          'sc-stage text-foreground pt-[calc(46svh+5rem)] pb-6 [text-shadow:0_0_2px_var(--background),0_0_4px_var(--background),0_0_10px_var(--background),0_0_24px_var(--background),0_0_52px_var(--background)] lg:min-h-[calc(100svh-5.75rem)] lg:pt-10 lg:pb-8',
        )}
      >
        {text}
      </div>
      {controls ? (
        <div
          className={cn(
            LAYER,
            'sc-stage justify-end pb-24 lg:min-h-[calc(100svh-5.75rem)] lg:pt-10 lg:pb-8',
          )}
        >
          {controls}
        </div>
      ) : null}
    </section>
  );
}

/** 첫 구역. 고정 장면이 아니라 한 화면 높이이고, 큰 제목은 차량 뒤(z-0)에 깔린다. */
export function HeroFrame({ children }: { children: ReactNode }) {
  return (
    <section
      id="intro-hero"
      data-intro-section
      tabIndex={-1}
      className="pointer-events-none relative outline-none lg:min-h-svh"
    >
      <div className="mx-auto flex w-full max-w-384 flex-col gap-10 px-5 pt-[calc(46svh+5rem)] pb-24 break-keep lg:min-h-svh lg:justify-between lg:gap-0 lg:px-12 lg:pt-24 lg:pb-16">
        {children}
      </div>
    </section>
  );
}

/** 글이나 조작 한 덩어리. 마우스를 받는다. */
export function SceneBlock({
  className,
  style,
  children,
}: {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className={cn('pointer-events-auto relative z-0 flex flex-col gap-5', className)}
      style={style}
    >
      {children}
    </div>
  );
}

/** 구역의 글(왼쪽 위): 작은 이름, 큰 제목, 설명. 글자색과 후광은 글 겹(`SceneFrame`의 `text`)이 정한다. */
export function SceneText({
  eyebrow,
  title,
  lead,
  as: Heading = 'h2',
}: {
  eyebrow: string;
  title: ReactNode;
  lead: ReactNode;
  as?: 'h1' | 'h2';
}) {
  return (
    <SceneBlock className="ip-float max-w-xl" style={vars({ '--ip-float': '28px' })}>
      {/* 넓은 화면: 이 덩어리(작은 이름과 제목)가 장면 시작에는 한가운데에 크게 있다가 스크롤 진행에 맞춰 왼쪽 위로 줄어든다. */}
      <div className="sc-title flex flex-col gap-3">
        <p className="ip-rise text-muted-foreground text-caption" style={order(0)}>
          {eyebrow}
        </p>
        <Mask>
          <Heading className="ip-line text-4xl leading-tight font-semibold tracking-tight text-balance lg:text-5xl">
            {title}
          </Heading>
        </Mask>
      </div>
      <div
        className="sc-in lg:bg-background/85 w-fit lg:-ml-4 lg:rounded-xl lg:p-4 lg:backdrop-blur-md"
        style={vars({ '--sc-i': 0 })}
      >
        <p className="ip-rise text-body text-foreground/85 max-w-md" style={order(2)}>
          {lead}
        </p>
      </div>
    </SceneBlock>
  );
}

/** 조작(오른쪽 아래). 차량 위에 놓이므로 배경을 깔아 글자가 차량에 묻히지 않게 한다. */
export function SceneControls({ children }: { children: ReactNode }) {
  return (
    // 좁은 화면에서는 바깥이 글보다 빠르게 흘러(시차) 안쪽이 올라오고, 넓은 화면에서는 장면 중반에 아래에서 올라온다(`sc-in`).
    // 두 연출은 같은 `animation`을 쓰므로 한 요소에 겹치지 않게 층을 나눴다.
    <SceneBlock
      className="ip-float w-full lg:max-w-sm lg:self-end"
      style={vars({ '--ip-float': '84px' })}
    >
      <div className="sc-in" style={vars({ '--sc-i': 1 })}>
        <div
          className="ip-rise border-border bg-background/85 flex w-full flex-col gap-5 rounded-xl border p-5 backdrop-blur-md"
          style={vars({ '--ip-i': 2, '--ip-rise': '64px', '--ip-rise-x': '72px' })}
        >
          {children}
        </div>
      </div>
    </SceneBlock>
  );
}

/** 패널 없이 단추만 놓는 조작(출발 구역). `SceneControls`처럼 장면 중반에 올라오고, 그 전에는 포커스가 가지 않는다. */
export function SceneAction({ children }: { children: ReactNode }) {
  return (
    <SceneBlock className="lg:self-end">
      <div className="sc-in" style={vars({ '--sc-i': 1 })}>
        {children}
      </div>
    </SceneBlock>
  );
}

/** 큰 값 한 줄. 선택이 바뀌면 값이 바뀐다(안에 `TextRoll`을 둔다). */
export function SceneValue({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="ip-rise flex flex-col gap-1" style={order(3)}>
      <span className="text-muted-foreground text-caption">{label}</span>
      <div className="text-6xl font-semibold tracking-tight lg:text-7xl">{children}</div>
    </div>
  );
}

/**
 * 화면 맨 아래에 고정된 구역 막대. 지금 읽는 구역을 강조하고 눌러서 이동한다. 맨 위의 가는 선은 문서 스크롤 진행도다
 * (CSS 스크롤 타임라인, 위치 표시라 감소 모션에서도 켠다).
 */
export function IntroRail({ active }: { active: IntroSectionId }) {
  return (
    <nav
      aria-label="구역 이동"
      className="border-border bg-background/90 fixed inset-x-0 bottom-0 z-40 flex h-9 items-stretch border-t text-xs backdrop-blur-sm print:hidden"
    >
      <span
        aria-hidden
        className="ip-progress bg-primary pointer-events-none absolute inset-x-0 -top-px h-px"
      />
      <p className="text-muted-foreground m-0 hidden items-center gap-2 px-4 sm:flex">
        <span aria-hidden className="bg-primary size-1.5 rounded-full" />
        {INTRO_SECTIONS.find((item) => item.id === active)?.label}
      </p>
      <ul className="m-0 ml-auto flex min-w-0 list-none overflow-x-auto p-0">
        {INTRO_SECTIONS.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id} className="m-0 flex">
              <Link
                aria-current={isActive ? 'location' : undefined}
                className={cn(
                  'border-border flex items-center border-l px-3 -outline-offset-2 focus-visible:outline-2 sm:px-4',
                  isActive
                    ? 'bg-primary text-primary-foreground focus-visible:outline-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground focus-visible:outline-ring',
                )}
                href={`#${item.id}`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
