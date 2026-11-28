'use client';

import { cn } from '@repo/ui/cn';
import { Reveal, RevealGroup } from '@repo/ui/reveal';
import { ScrollImageSequence } from '@repo/ui/scroll-image-sequence';
import type { CSSProperties, ReactNode } from 'react';

import { sequenceFrames } from '../model/frame-shots';

/** 위에 붙는 로컬 내비의 높이(px). 고정 장면이 그 아래에 붙는다. `IntroNav`의 `h-13`과 같다. */
export const NAV_PX = 52;

/** 좁은 화면 기준. `ScrollImageSequence`의 기본 `smallQuery`와 같다. */
const SMALL = '(max-width: 47.999rem)';

/**
 * 고정 장면의 진행도(`--sequence-progress`, 0–1)에 묶는 글자 연출. 스크롤로 정해지는 값이라 상태를 바꾸지 않고 CSS `calc()`로
 * 그린다. `start`부터 `span` 동안 0→1로 간다. 감소 모션과 스크립트 실행 전에는 변수가 비어 있어 `rest`(완성된 모습)를 쓴다.
 */
function ramp(start: number, span: number, rest: number) {
  return `clamp(0, calc((var(--sequence-progress, ${rest}) - ${start}) / ${span}), 1)`;
}

/** 진행도 `start`부터 나타난다: 아래 3vh에서 올라오며 불투명해진다(Polestar의 콜아웃). 감소 모션에서는 보인다. */
export function enterAt(start: number, span = 0.05): CSSProperties {
  const t = ramp(start, span, 1);
  return { opacity: t, translate: `0 calc((1 - ${t}) * 3vh)` };
}

/** 진행도 `start`부터 사라진다: 위로 32px 쓸려 올라가며 투명해진다(장면이 시작되면 제목이 차를 비켜 준다). 감소 모션에서는 보인다. */
export function leaveAt(start: number, span = 0.05): CSSProperties {
  const t = ramp(start, span, 0);
  return { opacity: `calc(1 - ${t})`, translate: `0 calc(${t} * -32px)` };
}

/** 세로 리더 라인: 진행도에 맞춰 차 쪽 끝에서 자란다. */
function growAt(start: number, span: number, from: 'top' | 'bottom'): CSSProperties {
  return { scale: `1 ${ramp(start, span, 1)}`, transformOrigin: `center ${from}` };
}

/** 구역의 큰 제목 묶음(눈썹·제목·설명). 화면에 들어올 때 한 번, 150ms 간격으로 30px 올라온다(Apple). */
export function SceneHeading({
  eyebrow,
  title,
  lead,
  align = 'center',
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'center' | 'start';
  className?: string;
}) {
  return (
    <RevealGroup
      stagger={0.15}
      className={cn(
        'flex max-w-4xl flex-col gap-5 break-keep',
        align === 'center' ? 'mx-auto items-center text-center' : 'items-start',
        className,
      )}
    >
      {eyebrow ? (
        <Reveal distance={30}>
          <p className="text-muted-foreground m-0 text-lg font-semibold sm:text-2xl">{eyebrow}</p>
        </Reveal>
      ) : null}
      <Reveal distance={30}>
        <h2 className="m-0 text-[2.5rem] leading-tight font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
          {title}
        </h2>
      </Reveal>
      {lead ? (
        <Reveal distance={30}>
          <p className="text-muted-foreground m-0 max-w-2xl text-lg leading-relaxed sm:text-xl">
            {lead}
          </p>
        </Reveal>
      ) : null}
    </RevealGroup>
  );
}

/** 이미지 칸(`contain`, 16:9)과 같은 크기의 상자. 콜아웃을 차의 부위에 맞춰 놓을 때 기준이 된다(`cqw`·`cqh`로 잰다). */
function FrameBox({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div
        className="relative aspect-video max-h-full w-full max-w-[calc((100svh-3.25rem)*16/9)]"
        style={{ containerType: 'size' }}
      >
        {children}
      </div>
    </div>
  );
}

export interface Callout {
  title: string;
  detail: string;
  /** 차의 부위(이미지 상자 기준 %) */
  x: number;
  y: number;
  /** 글이 놓이는 쪽. 차 위(`up`)나 아래(`down`)의 빈 곳으로 빼서 차체와 겹치지 않게 한다. */
  side: 'up' | 'down';
  /** 리더 라인 길이(이미지 상자 높이의 %) */
  reach: number;
}

/**
 * 360° 회전 장면(Polestar exterior-features). 고정 구간의 4–9%에 제목이 비켜 주고, 8–74%에 차가 한 바퀴 남짓 돌고, 그 뒤로 차의
 * 부위를 가리키는 콜아웃이 하나씩 붙는다(점 → 선 → 글). 좁은 화면에서는 리더 라인 없이 목록으로 쌓인다.
 */
export function OrbitScene({
  title,
  callouts,
}: {
  title: ReactNode;
  callouts: readonly Callout[];
}) {
  const base = 0.78;
  const step = 0.045;
  return (
    <section aria-label="360° 외관" className="dark bg-background text-foreground">
      <ScrollImageSequence
        alt="차량이 앞모습에서 한 바퀴 돌아 옆모습으로 멈춥니다."
        frames={sequenceFrames('orbit', 'lg')}
        smallFrames={sequenceFrames('orbit', 'sm')}
        smallQuery={SMALL}
        pinDistance={3.2}
        pinOffset={NAV_PX}
        frameRange={[0.08, 0.74]}
        restingProgress={1}
        portraitZoom={1.45}
        focusY={0.62}
        overlay="none"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-14 text-center break-keep sm:pt-20">
          <h2
            className="m-0 text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
            style={leaveAt(0.04)}
          >
            {title}
          </h2>
        </div>

        {/* 넓은 화면: 부위에서 위·아래 빈 곳으로 뻗는 리더 라인과 글 */}
        <div className="hidden lg:block">
          <FrameBox>
            {callouts.map((callout, index) => {
              const start = base + index * step;
              const up = callout.side === 'up';
              return (
                <div
                  key={callout.title}
                  className={cn(
                    'absolute flex w-52 -translate-x-1/2 items-center',
                    up ? 'flex-col-reverse' : 'flex-col',
                  )}
                  style={{
                    left: `${callout.x}%`,
                    ...(up ? { bottom: `${100 - callout.y}%` } : { top: `${callout.y}%` }),
                  }}
                >
                  <span
                    className="bg-foreground ring-background/60 size-2 shrink-0 rounded-full ring-4"
                    style={{
                      ...enterAt(start, 0.02),
                      translate: up ? '0 50%' : '0 -50%',
                    }}
                  />
                  <span
                    className="bg-foreground/70 w-px"
                    style={{
                      height: `${callout.reach}cqh`,
                      ...growAt(start, step * 0.6, up ? 'bottom' : 'top'),
                    }}
                  />
                  <div className="py-2 text-center" style={enterAt(start + step * 0.5)}>
                    <p className="m-0 text-base font-semibold">{callout.title}</p>
                    <p className="text-muted-foreground m-0 text-sm">{callout.detail}</p>
                  </div>
                </div>
              );
            })}
          </FrameBox>
        </div>

        {/* 좁은 화면: 차 아래에 목록으로 */}
        <ul className="absolute inset-x-0 bottom-0 m-0 grid list-none grid-cols-2 gap-4 p-6 lg:hidden">
          {callouts.map((callout, index) => (
            <li key={callout.title} style={enterAt(base + index * step)}>
              <p className="m-0 text-sm font-semibold">{callout.title}</p>
              <p className="text-muted-foreground m-0 text-xs">{callout.detail}</p>
            </li>
          ))}
        </ul>
      </ScrollImageSequence>
    </section>
  );
}

/**
 * 한 장면을 고정해 카메라가 다가가는 시퀀스(휠, 실내). 처음엔 제목이 위에 있다가 비켜 주고, 끝나 갈 때 아래쪽에 설명이 올라온다.
 */
export function ApproachScene({
  id,
  label,
  alt,
  title,
  lead,
  note,
  pinDistance = 2.4,
}: {
  id: 'wheel' | 'cabin';
  label: string;
  alt: string;
  title: ReactNode;
  lead: ReactNode;
  note?: ReactNode;
  pinDistance?: number;
}) {
  return (
    <section aria-label={label} className="dark bg-background text-foreground">
      <ScrollImageSequence
        alt={alt}
        frames={sequenceFrames(id, 'lg')}
        smallFrames={sequenceFrames(id, 'sm')}
        smallQuery={SMALL}
        pinDistance={pinDistance}
        pinOffset={NAV_PX}
        frameRange={[0.06, 0.82]}
        restingProgress={1}
        // 다가가는 장면은 차가 이미지 밖으로 나가므로 칸을 채운다(`contain`이면 이미지 가장자리에서 차체가 수평선으로 끊겨 보인다).
        fit="cover"
        focusY={0.6}
        overlay="none"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 px-6 pt-14 text-center break-keep sm:pt-20">
          <h2
            className="m-0 text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl"
            style={leaveAt(0.05)}
          >
            {title}
          </h2>
        </div>
        <div className="from-background/85 pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t to-transparent px-6 pt-24 pb-10 break-keep sm:px-12 sm:pb-14">
          <div className="mx-auto flex max-w-5xl flex-col gap-3" style={enterAt(0.84)}>
            <p className="m-0 max-w-2xl text-xl leading-snug font-semibold sm:text-3xl">{lead}</p>
            {note ? <p className="text-muted-foreground m-0 text-sm">{note}</p> : null}
          </div>
        </div>
      </ScrollImageSequence>
    </section>
  );
}
