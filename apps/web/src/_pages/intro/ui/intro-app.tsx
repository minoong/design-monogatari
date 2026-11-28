'use client';

import { AnimatedAmount } from '@repo/ui/animated-amount';
import { Button } from '@repo/ui/button';
import { cn } from '@repo/ui/cn';
import { Reveal, RevealGroup } from '@repo/ui/reveal';
import { ScrollImageSequence } from '@repo/ui/scroll-image-sequence';
import { vehicleById } from '@repo/vehicle-3d/vehicles';
import { INSIDE_VIEW_NOTE_APPROX } from '@repo/vehicle-3d/views';
import Link from 'next/link';
import { type CSSProperties, useMemo, useState } from 'react';

import {
  calculateQuote,
  CATALOG,
  DEFAULT_OPTIONS,
  encodeEstimate,
  formatWon,
  WHEEL_INCH,
} from '@/_pages/estimate/index.model';

import { sequenceFrames } from '../model/frame-shots';
import { chooseInIntro, createIntroSelection, type IntroSlot } from '../model/intro-selection';
import {
  ConfiguratorPanel,
  exteriorLayers,
  interiorLayers,
  StillStack,
} from './intro-configurator';
import { IntroNav } from './intro-nav';
import { ApproachScene, type Callout, OrbitScene, SceneHeading } from './intro-scenes';
import {
  describeChoice,
  IntroChoiceGroup,
  IntroColorGroup,
  type IntroNotices,
  IntroNoticeSlot,
  IntroPrice,
} from './intro-sections';

const VEHICLE = vehicleById('x5-web');

/**
 * 밝은 구역의 토큰 범위. 인트로 전체는 `dark`이고, 사양·구성기·가격 구역만 `light`로 하드컷한다(Apple·Polestar). 클래스 이름이
 * Tailwind 유틸리티가 아니라 토큰 선택자(`.light`, `packages/ui/src/styles/globals.css`)라서 상수로 둔다.
 */
const LIGHT_SCOPE = 'light';

const COLOR_IDS = CATALOG.color.map((item) => item.id as string);
const WHEEL_IDS = CATALOG.wheel.map((item) => item.id as string);
const INTERIOR_IDS = CATALOG.interior.map((item) => item.id as string);
const EXTERIOR_LAYERS = exteriorLayers(COLOR_IDS, WHEEL_IDS);
const INTERIOR_LAYERS = interiorLayers(INTERIOR_IDS);

/** 360° 장면이 멈추는 옆모습(앞이 왼쪽)에서 콜아웃이 가리키는 부위. 위치는 마지막 프레임을 보고 맞춘 값이다. */
const CALLOUTS: readonly Callout[] = [
  { title: 'LED 헤드램프', detail: '모든 트림 기본', x: 20.5, y: 57, side: 'up', reach: 24 },
  {
    title: '최대 21인치 휠',
    detail: '스포트 트림에서 선택',
    x: 28,
    y: 69,
    side: 'down',
    reach: 14,
  },
  { title: '파노라마 선루프', detail: '패키지로 선택', x: 58, y: 40, side: 'up', reach: 12 },
  { title: '브레이크 캘리퍼', detail: '여섯 가지 색', x: 70, y: 72, side: 'down', reach: 14 },
];

/** 큰 숫자 사양(Polestar charging). 카탈로그의 실제 값이다. */
const INCHES = Object.values(WHEEL_INCH);
const SPECS = [
  { value: `${(CATALOG.basePrice / 10_000).toLocaleString('ko-KR')}만`, label: '시작가(원)' },
  { value: `${CATALOG.powertrain.length}`, label: '파워트레인' },
  { value: `${CATALOG.color.length}`, label: '외장 색상' },
  { value: `${Math.min(...INCHES)}–${Math.max(...INCHES)}`, label: '휠(인치)' },
] as const;

/** 큰 값이 굴러가는 자리. 목록 뒤쪽으로 가면 위로, 앞쪽으로 가면 아래로 굴러 오가는 방향과 맞는다. */
const ROLL_SLOTS = ['color', 'wheel', 'interior'] as const;
type RollSlot = (typeof ROLL_SLOTS)[number];

/** 첫 화면 글자는 자바스크립트 없이 CSS로 한 번 올라온다(`intro-rise`). 순서가 클수록 150ms씩 늦다. */
function rise(order: number): CSSProperties {
  return { '--rise-i': order } as CSSProperties;
}

function labelOf(slot: IntroSlot, id: string) {
  return CATALOG[slot].find((item) => item.id === id)?.label ?? '';
}

export function IntroApp() {
  const [selection, setSelection] = useState(createIntroSelection);
  const [notices, setNotices] = useState<IntroNotices>({});
  const [rolls, setRolls] = useState<Partial<Record<RollSlot, 'up' | 'down'>>>({});

  const quote = useMemo(() => calculateQuote(selection, DEFAULT_OPTIONS), [selection]);
  // 인트로에서 고른 사양을 견적 화면이 그대로 이어받는다.
  const startHref = `/estimate?${encodeEstimate({ selection, quoteOptions: DEFAULT_OPTIONS })}`;

  const choose = (slot: IntroSlot, id: string) => {
    const change = chooseInIntro(selection, slot, id);
    if (change.blockedReason !== null) {
      setNotices((previous) => ({
        ...previous,
        [slot]: { blocked: true, lines: [change.blockedReason ?? ''] },
      }));
      return;
    }
    setRolls((previous) => {
      const next = { ...previous };
      for (const rollSlot of ROLL_SLOTS) {
        const ids = CATALOG[rollSlot].map((item) => item.id as string);
        const from = ids.indexOf(selection[rollSlot]);
        const to = ids.indexOf(change.selection[rollSlot]);
        if (from !== to) next[rollSlot] = to > from ? 'up' : 'down';
      }
      return next;
    });
    setSelection(change.selection);
    setNotices((previous) => ({
      ...previous,
      [slot]: { blocked: false, lines: change.sentences },
    }));
  };

  return (
    <div data-intro-root className="dark bg-background text-foreground min-h-dvh">
      <IntroNav total={quote.total} startHref={startHref} />

      <main>
        {/* 1. 히어로: 차가 멀리 정면에서 앞 3/4로 다가오는 장면이 한 번 재생된다(Apple의 히어로 영상). */}
        <section aria-labelledby="intro-title" className="-mt-13">
          <ScrollImageSequence
            mode="play"
            playSeconds={2.6}
            alt="흰색 X5가 어둠 속에서 다가옵니다."
            frames={sequenceFrames('reveal', 'lg')}
            smallFrames={sequenceFrames('reveal', 'sm')}
            restingProgress={1}
            portraitZoom={1.5}
            focusY={0.64}
            overlay="none"
          >
            <div className="absolute inset-x-0 top-0 flex flex-col items-center gap-4 px-6 pt-24 text-center break-keep sm:pt-24">
              <p
                className="intro-rise text-muted-foreground m-0 text-lg font-semibold sm:text-2xl"
                style={rise(0)}
              >
                X5 견적
              </p>
              <h1
                id="intro-title"
                className="intro-rise m-0 text-5xl leading-none font-semibold tracking-tight sm:text-7xl 2xl:text-8xl"
                style={rise(1)}
              >
                고르는 대로
                <br />
                계산됩니다.
              </h1>
            </div>
            {/* 가격과 시작 단추(Apple 히어로의 구입 알약). 히어로 안에서만 아래에 놓인다. */}
            <div className="absolute inset-x-0 bottom-8 flex justify-center px-5">
              <div
                className="intro-rise border-border bg-background/70 flex items-center gap-4 rounded-full border py-2 pr-2 pl-5 backdrop-blur-xl"
                style={rise(2)}
              >
                <span className="text-sm">
                  <span className="font-semibold tabular-nums">{formatWon(CATALOG.basePrice)}</span>
                  부터
                </span>
                <Button asChild radius="pill">
                  <Link href={startHref}>견적 시작하기</Link>
                </Button>
              </div>
            </div>
          </ScrollImageSequence>
        </section>

        {/* 2. 문장 */}
        <section className="px-6 py-36 sm:py-48">
          <SceneHeading
            eyebrow="고르기 전에 알려 드립니다"
            title={
              <>
                선택 하나에,
                <br />
                가격 하나.
              </>
            }
            lead="트림에 따라 열리는 휠과 색이 다릅니다. 고를 수 없는 항목은 이유와 함께 보이고, 함께 바뀐 항목은 문장으로 알려 드립니다."
          />
        </section>

        {/* 3. 360° 회전 */}
        <OrbitScene title="어느 각도에서 봐도." callouts={CALLOUTS} />

        {/* 4. 큰 숫자 사양(밝은 구역으로 하드컷) */}
        <section className={cn(LIGHT_SCOPE, 'bg-muted text-foreground px-6 py-32 sm:py-40')}>
          <div className="mx-auto flex max-w-6xl flex-col gap-16">
            <SceneHeading align="start" title="숫자로 먼저 보십시오." />
            <RevealGroup
              stagger={0.15}
              className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4"
            >
              {SPECS.map((spec) => (
                <Reveal key={spec.label} distance={30}>
                  <dl className="border-foreground/20 m-0 flex flex-col-reverse gap-3 border-t pt-4">
                    <dt className="text-muted-foreground text-sm">{spec.label}</dt>
                    <dd className="m-0 text-5xl font-normal tracking-tighter tabular-nums sm:text-7xl">
                      {spec.value}
                    </dd>
                  </dl>
                </Reveal>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* 5. 휠로 다가가기 */}
        <ApproachScene
          id="wheel"
          label="휠"
          alt="카메라가 옆모습에서 앞바퀴로 다가가 림이 화면을 채웁니다."
          title="휠까지 가까이."
          lead="19, 20, 21인치. 고른 크기가 림과 타이어 두께에 그대로 반영됩니다."
        />

        {/* 6. 구성기: 색과 휠(밝은 구역) */}
        <section
          aria-labelledby="intro-build-title"
          className={cn(LIGHT_SCOPE, 'bg-background text-foreground px-6 py-28 sm:py-36')}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-14">
            <SceneHeading
              eyebrow="직접 골라 보십시오"
              title={<span id="intro-build-title">색과 휠을 바꾸면 바로 칠해집니다.</span>}
            />
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
              <StillStack
                className="bg-background sticky top-13 z-20 lg:top-24"
                layers={EXTERIOR_LAYERS}
                active={`${selection.color}-${selection.wheel}`}
                crop
                alt={`선택한 사양의 X5: ${describeChoice(selection)}`}
              />
              <ConfiguratorPanel
                label="외장 색상"
                value={labelOf('color', selection.color)}
                direction={rolls.color}
              >
                <IntroChoiceGroup
                  slot="trim"
                  legend="트림"
                  selection={selection}
                  onChoose={choose}
                />
                <IntroNoticeSlot notice={notices.trim} />
                <IntroColorGroup selection={selection} onChoose={choose} />
                <IntroNoticeSlot notice={notices.color} />
                <IntroChoiceGroup
                  slot="wheel"
                  legend="휠"
                  selection={selection}
                  onChoose={choose}
                />
                <IntroNoticeSlot notice={notices.wheel} />
              </ConfiguratorPanel>
            </div>
          </div>
        </section>

        {/* 7. 실내로 들어가기 */}
        <ApproachScene
          id="cabin"
          label="실내"
          alt="카메라가 차 위에서 선루프 너머로 내려와 운전석에서 앞을 봅니다."
          title="운전석으로."
          lead="실내 색은 외장 색에 어울리는 조합만 고를 수 있습니다."
          note={INSIDE_VIEW_NOTE_APPROX}
          pinDistance={2.8}
        />

        {/* 8. 내장 색 */}
        <section aria-labelledby="intro-cabin-title" className="px-6 py-28 sm:py-36">
          <div className="mx-auto grid max-w-7xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <StillStack
              layers={INTERIOR_LAYERS}
              active={selection.interior}
              alt={`선택한 내장 색: ${labelOf('interior', selection.interior)}`}
              className="bg-background sticky top-13 z-20 lg:top-24 [&>div]:overflow-hidden [&>div]:rounded-lg"
            />
            <ConfiguratorPanel
              label="내장 색상"
              value={labelOf('interior', selection.interior)}
              direction={rolls.interior}
            >
              <h2 id="intro-cabin-title" className="sr-only">
                내장 색상
              </h2>
              <IntroChoiceGroup
                slot="interior"
                legend="내장 색상"
                selection={selection}
                onChoose={choose}
              />
              <IntroNoticeSlot notice={notices.interior} />
            </ConfiguratorPanel>
          </div>
        </section>

        {/* 9. 가격과 출발(밝은 구역) */}
        <section
          aria-labelledby="intro-price-title"
          className={cn(LIGHT_SCOPE, 'bg-muted text-foreground px-6 py-28 sm:py-36')}
        >
          <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[minmax(0,1fr)_28rem] lg:items-start">
            <RevealGroup stagger={0.15} className="flex flex-col gap-6 break-keep">
              <Reveal distance={30}>
                <h2
                  id="intro-price-title"
                  className="text-muted-foreground m-0 text-lg font-semibold sm:text-2xl"
                >
                  지금 사양의 총 예상 금액
                </h2>
              </Reveal>
              <Reveal distance={30}>
                <p aria-hidden className="m-0 text-5xl font-semibold tracking-tight sm:text-7xl">
                  <AnimatedAmount value={quote.total} prefix="₩" />
                </p>
              </Reveal>
              <Reveal distance={30}>
                <p className="text-muted-foreground m-0 max-w-xl text-lg">
                  소비자가에 취득세와 부대비용을 더한 금액입니다. 고른 사양은 견적 화면에 그대로
                  이어지고, 시트와 선택 품목은 다음 단계에서 고르실 수 있습니다.
                </p>
              </Reveal>
              <Reveal distance={30}>
                <Button asChild size="large">
                  <Link href={startHref}>지금 사양으로 견적 시작하기</Link>
                </Button>
              </Reveal>
            </RevealGroup>
            <IntroPrice quote={quote} />
          </div>
        </section>
      </main>

      <footer
        className={cn(
          LIGHT_SCOPE,
          'bg-muted text-muted-foreground border-border border-t px-6 py-10 text-xs',
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-2">
          <p className="m-0">
            비공식 포트폴리오입니다. BMW와 무관하며 가격과 사양은 모두 가상의 값입니다.
          </p>
          <details>
            <summary className="focus-visible:ring-ring w-fit cursor-pointer rounded-sm underline underline-offset-2 outline-hidden focus-visible:ring-2">
              3D 모델 출처와 고지
            </summary>
            <div className="mt-2 flex flex-col gap-1">
              <p className="m-0">
                <a
                  className="underline underline-offset-2"
                  href={VEHICLE.credit.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {VEHICLE.credit.work}
                </a>
                {' · '}
                {VEHICLE.credit.by}
                {' · '}
                <a
                  className="underline underline-offset-2"
                  href={VEHICLE.credit.licenseHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  {VEHICLE.credit.license}
                </a>
                {' · '}
                <a
                  className="underline underline-offset-2"
                  href={VEHICLE.credit.disclaimerHref}
                  rel="noreferrer"
                  target="_blank"
                >
                  보증 부인
                </a>
              </p>
              <p className="m-0">수정: {VEHICLE.credit.changes}</p>
              <p className="m-0">{VEHICLE.credit.trademark}</p>
            </div>
          </details>
        </div>
      </footer>

      {/* 총액 변화를 알린다. 화면의 큰 숫자(`AnimatedAmount`)는 스크린 리더에서 숨겨져 있어서 이 영역이 읽어 준다. */}
      <p role="status" className="sr-only">
        총 예상 금액 {formatWon(quote.total)}
      </p>
    </div>
  );
}
