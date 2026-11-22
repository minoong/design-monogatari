'use client';

import { Button } from '@repo/ui/button';
import { Segmented, SegmentedItem } from '@repo/ui/segmented';
import Link from 'next/link';
import { type CSSProperties, useCallback, useState } from 'react';

import { Accent } from './lab-section';
import { SuvDither } from './suv-dither';
import { SuvLattice } from './suv-lattice';
import { SuvWebgl } from './suv-webgl';

type Variant = 'lattice' | 'dither' | 'webgl';

const VARIANTS: { value: Variant; label: string; note: string }[] = [
  {
    value: 'lattice',
    label: '도트 격자',
    note: 'SVG 패턴 하나로 그립니다. 자바스크립트가 없고 서버에서 그려져 첫 화면부터 보입니다.',
  },
  {
    value: 'dither',
    label: '디더링',
    note: '밝기 지도를 8×8 Bayer 문턱값과 비교해 점을 찍습니다. 2D 캔버스이고 움직이지 않습니다.',
  },
  {
    value: 'webgl',
    label: 'WebGL 디더링',
    note: '같은 지도를 셰이더가 찍습니다. 빛 띠가 차체를 쓸고 지나가고, 커서 둘레가 밝아집니다.',
  },
];

/** 스크롤 속도를 겹마다 다르게 주는 값. 양수는 천천히(뒤로), 음수는 빠르게(앞으로) 움직인다. */
function shift(px: number): CSSProperties {
  return { '--lp-shift': `${px}px` } as CSSProperties;
}

function Callout({
  className,
  label,
  leader,
  below = false,
}: {
  className: string;
  label: string;
  /** 표지선 길이(컨테이너 높이 대비 %) */
  leader: number;
  /** 점을 위에 두고 이름표를 아래에 단다(차체 아래쪽을 가리킬 때) */
  below?: boolean;
}) {
  return (
    <li
      className={`absolute m-0 flex -translate-x-1/2 items-center ${below ? 'flex-col-reverse' : 'flex-col'} ${className}`}
    >
      <span className="border-border bg-background/80 text-foreground rounded-full border px-3 py-1 font-mono text-xs whitespace-nowrap backdrop-blur-sm">
        {label}
      </span>
      <span
        aria-hidden
        className="border-foreground/40 block w-0 border-l border-dotted"
        style={{ height: `${leader}cqh` }}
      />
      <span aria-hidden className="bg-primary block size-2 rounded-full" />
    </li>
  );
}

/**
 * 랜딩 실험 히어로. 점으로 그린 가상의 SUV와, 겹마다 속도가 다른 스크롤 패럴렉스.
 * 겹은 뒤에서 앞으로: 점 바탕(+60px) → SUV(+34px) → 바닥 점선(+12px) → 설명 표지(−46px).
 * 기본 표현은 WebGL이고, 나머지 둘은 비교용이다.
 */
export function HeroLab() {
  const [variant, setVariant] = useState<Variant>('webgl');
  const [fellBack, setFellBack] = useState(false);
  const [paused, setPaused] = useState(false);
  const current = VARIANTS.find((item) => item.value === variant) ?? VARIANTS[0];
  const onFallback = useCallback(() => setFellBack(true), []);

  return (
    <section
      aria-labelledby="lab-hero-title"
      className="relative isolate scroll-mt-20 overflow-clip"
      id="hero"
    >
      <div
        aria-hidden
        className="lp-drift text-foreground/15 pointer-events-none absolute inset-x-0 top-0 -z-10 h-[130%] bg-[radial-gradient(circle_closest-side,currentColor_55%,transparent_60%)] mask-[radial-gradient(75%_55%_at_50%_35%,black,transparent)] bg-size-[18px_18px]"
        style={shift(60)}
      />
      <div
        aria-hidden
        className="lp-drift text-primary/40 dark:text-primary-on-dark/40 pointer-events-none absolute top-[6%] right-[5%] -z-10 hidden size-72 rounded-full bg-[radial-gradient(circle_closest-side,currentColor_55%,transparent_60%)] mask-[radial-gradient(circle,black_62%,transparent_70%)] bg-size-[14px_14px] md:block lg:size-96"
        style={shift(96)}
      />
      <div
        aria-hidden
        className="lp-drift text-foreground/30 pointer-events-none absolute top-[58%] left-[3%] -z-10 hidden size-28 bg-[radial-gradient(circle_closest-side,currentColor_50%,transparent_60%)] mask-[radial-gradient(closest-side,black,transparent)] bg-size-[10px_10px] md:block"
        style={shift(-30)}
      />
      <div
        aria-hidden
        className="lp-drift text-foreground/30 pointer-events-none absolute right-[22%] bottom-[14%] -z-10 hidden size-20 bg-[radial-gradient(circle_closest-side,currentColor_50%,transparent_60%)] mask-[radial-gradient(closest-side,black,transparent)] bg-size-[8px_8px] md:block"
        style={shift(28)}
      />

      <div className="mx-auto w-full max-w-6xl px-4 pt-14 md:px-6 md:pt-24">
        <div className="flex max-w-3xl flex-col items-start gap-6 break-keep">
          <p className="border-primary/40 text-primary dark:text-primary-on-dark m-0 rounded-full border px-3 py-1 font-mono text-xs">
            점으로 그린 SUV
          </p>
          <h1
            className="m-0 text-4xl font-medium tracking-tight text-balance md:text-6xl"
            id="lab-hero-title"
          >
            차분한 화면, <Accent>정확한</Accent> 견적.
          </h1>
          <p className="text-muted-foreground m-0 text-base leading-7 text-pretty md:text-lg">
            가상의 SUV 한 대를 점으로 그렸습니다. 스크롤하면 겹마다 다른 속도로 움직이고, 아래로
            내려갈수록 구역마다 다른 장면이 이어집니다.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild radius="pill" variant="primary">
              <Link href="/docs">시작하기</Link>
            </Button>
            <Button asChild radius="pill" variant="secondary">
              <Link href="/docs/components/button">컴포넌트 보기</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-20 w-full max-w-6xl px-4 md:px-6">
        <div className="relative mx-auto max-w-5xl" data-lp-stage>
          <div className="lp-drift" style={shift(34)}>
            <div aria-label="점으로 그린 가상의 SUV 옆모습" className="relative" role="img">
              {variant === 'lattice' ? <SuvLattice /> : null}
              {variant === 'dither' ? <SuvDither /> : null}
              {variant === 'webgl' ? (
                <SuvWebgl key="webgl" paused={paused} onFallback={onFallback} />
              ) : null}
            </div>
          </div>

          <div
            aria-hidden
            className="lp-drift text-foreground/40 pointer-events-none absolute inset-x-0 bottom-[2%] h-2 bg-[radial-gradient(circle_closest-side,currentColor_50%,transparent_60%)] mask-[linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] bg-size-[12px_8px]"
            style={shift(12)}
          />

          <ul
            aria-label="차량 주요 사양"
            className="lp-drift @container-size pointer-events-none absolute inset-0 m-0 hidden list-none p-0 lg:block"
            style={shift(-46)}
          >
            <Callout className="top-[-16%] left-[42%]" label="파노라마 글라스 루프" leader={35} />
            <Callout below className="top-[75%] left-[75%]" label="20인치 알로이 휠" leader={22} />
            <Callout className="top-[8%] left-[90%]" label="어댑티브 LED 헤드라이트" leader={40} />
          </ul>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Segmented
              aria-label="도트 표현 방식"
              className="w-full sm:w-fit"
              value={variant}
              onValueChange={(value) => {
                setFellBack(false);
                setVariant(value as Variant);
              }}
            >
              {VARIANTS.map((item) => (
                <SegmentedItem key={item.value} className="flex-1" value={item.value}>
                  {item.label}
                </SegmentedItem>
              ))}
            </Segmented>
            {variant === 'webgl' ? (
              <Button
                aria-pressed={paused}
                radius="pill"
                size="small"
                variant="secondary"
                onClick={() => setPaused((value) => !value)}
              >
                빛 띠 멈춤
              </Button>
            ) : null}
          </div>
          <p aria-live="polite" className="text-muted-foreground m-0 max-w-2xl text-sm leading-6">
            {current?.note}
            {variant === 'webgl' && fellBack
              ? ' 이 브라우저에서는 WebGL2를 쓸 수 없어 디더링으로 대신 그렸습니다.'
              : null}
          </p>
        </div>
      </div>
    </section>
  );
}
