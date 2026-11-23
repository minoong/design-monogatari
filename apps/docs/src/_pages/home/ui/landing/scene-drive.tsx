'use client';

import { Button } from '@repo/ui/button';
import Link from 'next/link';

import { ESTIMATE_COLORS } from '../estimate-colors';
import { HillsDither } from './hills-dither';
import { Accent } from './landing-section';
import { WINDOW_PATHS } from './suv';
import { SuvCockpit } from './suv-cockpit';
import { SuvWebgl } from './suv-webgl';

/** 앞뒤 창 모양을 계기판 그림(324×38, 원점 = 도형 좌표 112,80)에 맞춰 잘라 낸다. */
const WINDOW_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 324 38"><g transform="translate(-112 -80)">${WINDOW_PATHS.map((d) => `<path d="${d}"/>`).join('')}</g></svg>`,
)}")`;

const BLUE = ESTIMATE_COLORS.find((entry) => entry.value === 'blue')?.color ?? null;

/**
 * 닫는 구역: 계기판에서 시작해 차 밖으로 나온다(fumadocs.dev의 터미널 → 모니터 전환을 우리 식으로).
 * 무대가 화면에 붙어 있는 동안 스크롤이 카메라가 된다. 카메라는 앞 창 한가운데를 기준으로 5배(좁은 화면은 3배)에서
 * 1배로 물러나, 창 안의 계기판 → 차체 → 도로와 언덕 순서로 보이게 한다. 먼 풍경은 차보다 느리게 줄어든다.
 * 타임라인이 없거나 감소 모션이면 처음부터 차 전체가 보이는 정지 장면이다.
 */
export function SceneDrive() {
  return (
    <div className="lp-cam-section relative scroll-mt-14" id="drive">
      <section
        aria-labelledby="drive-title"
        className="lp-cam-stage lp-cam-sky bg-background h-[calc(100svh-3.5rem-2.25rem)] min-h-136 overflow-clip"
      >
        <div aria-hidden className="lp-cam-iris-far absolute inset-0">
          <div className="lp-cam-far absolute inset-x-0 bottom-0 origin-bottom">
            <div className="text-primary dark:text-primary-on-dark absolute right-[14%] bottom-[34%] size-24 rounded-full bg-[radial-gradient(circle_closest-side,currentColor_55%,transparent_62%)] bg-size-[9px_9px] md:size-36" />
            <HillsDither className="relative" />
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center px-4 md:px-6">
          <div
            className="lp-cam relative w-[min(880px,100%)] [--cam-s0:3] md:[--cam-s0:5]"
            data-lp-stage
          >
            <div className="lp-cam-iris relative">
              <div aria-label="계기판이 보이는 창이 달린 가상의 SUV 옆모습" role="img">
                <SuvWebgl paint={BLUE} />
              </div>
              <div
                aria-hidden
                className="text-foreground/40 pointer-events-none absolute inset-x-0 bottom-[3%] h-2 bg-[radial-gradient(circle_closest-side,currentColor_50%,transparent_60%)] mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] bg-size-[12px_8px]"
              />
            </div>
            <div
              aria-hidden
              className="bg-card pointer-events-none absolute top-[32%] left-[17.5%] h-[15.2%] w-[50.625%]"
              style={{
                maskImage: WINDOW_MASK,
                maskSize: '100% 100%',
                WebkitMaskImage: WINDOW_MASK,
                WebkitMaskSize: '100% 100%',
              }}
            >
              <SuvCockpit />
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 top-0 z-10 mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pt-6 break-keep md:flex-row md:items-end md:justify-between md:px-6 md:pt-10">
          <div className="overflow-clip pb-1">
            <h2
              className="lp-cam-copy m-0 max-w-2xl text-3xl font-medium tracking-tight text-balance md:text-5xl"
              id="drive-title"
            >
              계기판에서 시작해,
              <br />
              <Accent>견적서로 도착합니다.</Accent>
            </h2>
          </div>
          <div className="overflow-clip pb-1">
            <div className="lp-cam-links flex flex-wrap gap-3">
              <Button asChild radius="pill" variant="primary">
                <Link href="/docs">문서 읽기</Link>
              </Button>
              <Button asChild radius="pill" variant="secondary">
                <Link href="/docs/components/button">전체 컴포넌트 보기</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
