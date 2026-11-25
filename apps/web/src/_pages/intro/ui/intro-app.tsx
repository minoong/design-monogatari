'use client';

import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { TextRoll } from '@repo/ui/text-roll';
import { vehicleById } from '@repo/vehicle-3d/vehicles';
import Link from 'next/link';
import { type RefObject, useEffect, useMemo, useRef, useState } from 'react';

import {
  calculateQuote,
  CATALOG,
  DEFAULT_OPTIONS,
  encodeEstimate,
  formatWon,
  WHEEL_INCH,
} from '@/_pages/estimate/index.model';
import { ThemeToggle } from '@/shared/ui/theme-toggle';

import { chooseInIntro, createIntroSelection, type IntroSlot } from '../model/intro-selection';
import {
  HeroFrame,
  INTRO_SECTIONS,
  IntroRail,
  type IntroSectionId,
  Mask,
  SceneAction,
  SceneBlock,
  SceneControls,
  SceneFrame,
  SceneText,
  SceneValue,
  vars,
} from './intro-scene';
import {
  describeChoice,
  IntroChoiceGroup,
  IntroColorGroup,
  type IntroNotices,
  IntroNoticeSlot,
  IntroPrice,
} from './intro-sections';
import { IntroStage } from './intro-stage';
import Counter from './react-bits/Counter';
import SplitFlapText from './react-bits/SplitFlapText';

const VEHICLE = vehicleById('x5-web');

/** 차량이 화면 전체에 깔리는 너비(Tailwind `lg`). 그보다 좁으면 차량이 위에 고정되고 글이 그 아래로 흐른다. */
const WIDE_QUERY = '(min-width: 64rem)';

const HEADER_PX = 56;
const RAIL_PX = 36;

/**
 * 읽고 있는 구역을 정한다. 구역이 바뀐 순간에만 상태가 바뀌므로 스크롤 값이 차량을 직접 움직이지 않는다(스크롤은 "어느 구역인가"만
 * 정하고, 카메라 이동은 3D 쪽이 한 번의 부드러운 전환으로 처리한다).
 * 판정 띠는 가려지지 않고 보이는 영역의 위쪽 30% 지점이다. 위는 고정 머리말(좁은 화면에서는 고정 차량 칸까지), 아래는 구역 막대가
 * 가리므로, 고정된 요소 뒤에 띠가 숨지 않게 화면 크기에 맞춰 다시 계산한다.
 */
function useActiveSection(stageRef: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState<IntroSectionId>('intro-hero');

  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const observe = () => {
      observer?.disconnect();
      const viewport = window.innerHeight;
      const stacked = !window.matchMedia(WIDE_QUERY).matches;
      const covered = HEADER_PX + (stacked ? (stageRef.current?.offsetHeight ?? 0) : 0);
      const band = Math.round(covered + (viewport - covered - RAIL_PX) * 0.3);
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) setActive(entry.target.id as IntroSectionId);
          }
        },
        { rootMargin: `${-band}px 0px ${-(viewport - band - 2)}px 0px` },
      );
      for (const section of INTRO_SECTIONS) {
        const element = document.getElementById(section.id);
        if (element) observer.observe(element);
      }
    };

    observe();
    window.addEventListener('resize', observe);
    return () => {
      window.removeEventListener('resize', observe);
      observer?.disconnect();
    };
  }, [stageRef]);

  return active;
}

function labelOf(slot: IntroSlot, id: string) {
  return CATALOG[slot].find((item) => item.id === id)?.label ?? '';
}

/** 큰 값으로 보이는 자리. 선택이 바뀌면 이 값들이 굴러간다(트림 때문에 휠이나 색이 함께 바뀌어도 방향을 따로 정한다). */
const ROLL_SLOTS = ['color', 'wheel', 'interior'] as const;
type RollSlot = (typeof ROLL_SLOTS)[number];

/** 히어로의 사양 줄. 카탈로그의 실제 값이다. */
const INCHES = Object.values(WHEEL_INCH);
const SPECS = [
  ['시작가', formatWon(CATALOG.basePrice)],
  ['파워트레인', CATALOG.powertrain[0]?.label ?? ''],
  ['외장 색상', `${CATALOG.color.length}가지`],
  ['휠', `${Math.min(...INCHES)}–${Math.max(...INCHES)}인치`],
] as const;

export function IntroApp() {
  const [selection, setSelection] = useState(createIntroSelection);
  const [notices, setNotices] = useState<IntroNotices>({});
  // 큰 값이 굴러가는 방향. 목록에서 뒤쪽 항목으로 가면 위로, 앞쪽으로 돌아가면 아래로 굴러서, 오가는 방향과 움직임이 맞는다.
  const [rolls, setRolls] = useState<Partial<Record<RollSlot, 'up' | 'down'>>>({});
  const stageRef = useRef<HTMLElement>(null);
  const active = useActiveSection(stageRef);

  const quote = useMemo(() => calculateQuote(selection, DEFAULT_OPTIONS), [selection]);
  // 인트로에서 고른 사양을 견적 화면이 그대로 이어받는다.
  const startHref = `/estimate?${encodeEstimate({ selection, quoteOptions: DEFAULT_OPTIONS })}`;
  const view = INTRO_SECTIONS.find((section) => section.id === active)?.view ?? 'exterior';

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
    <div data-intro-root className="bg-background text-foreground min-h-dvh">
      <header className="border-border bg-background/90 sticky top-0 z-40 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-sm lg:px-6">
        <p className="text-body shrink-0 font-semibold tracking-tight">X5 견적</p>
        <Badge
          className="hidden md:inline-flex"
          variant="secondary"
          title="비공식 포트폴리오입니다. BMW와 무관하며 가격과 사양은 모두 가상의 값입니다."
        >
          비공식 · 가상 데이터
        </Badge>
        <div className="ml-auto flex items-center gap-3">
          {/* 지금 사양의 총액. 숫자는 화면용이고, 읽어 주는 상태 영역은 아래에 있다. */}
          <div aria-hidden className="hidden items-baseline gap-2 sm:flex">
            <span
              className="text-muted-foreground text-caption"
              title="소비자가에 취득세와 부대비용을 더한 금액입니다"
            >
              총 예상 금액
            </span>
            <Counter
              value={quote.total}
              prefix="₩"
              locale="ko-KR"
              fontSize="1.125rem"
              fontWeight={600}
            />
          </div>
          <Button asChild size="small">
            <Link href={startHref}>견적 시작</Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* 차량. 넓은 화면에서는 화면 전체에 고정되어 글 뒤에 깔리고(캔버스는 투명), 좁은 화면에서는 머리말 아래 위쪽에 고정된다. */}
      <aside
        ref={stageRef}
        aria-label="차량 미리보기"
        className="border-border bg-background fixed inset-x-0 top-14 z-10 h-[46svh] border-b lg:inset-y-14 lg:h-auto lg:border-b-0 lg:bg-transparent"
      >
        <IntroStage
          selection={selection}
          view={view}
          label={`선택한 사양의 X5 3D 차량: ${describeChoice(selection)}`}
        />
      </aside>

      <main>
        <HeroFrame>
          {/* 큰 제목은 차량 뒤(z-0)에 깔려 차량이 글자 앞을 지난다. 글자는 읽는 용도라 마우스를 받지 않는다. */}
          <h1 className="pointer-events-none relative z-0 text-[clamp(3.5rem,11vw,10rem)] leading-none font-semibold tracking-tighter">
            {/* 두 줄이 마스크 아래에서 한 번 올라오고(`ip-enter`), 스크롤하면 서로 반대 방향으로 흘러간다(`ip-slide`). */}
            <Mask>
              <span className="ip-slide block" style={vars({ '--ip-dx': '-9vw' })}>
                <span className="ip-enter block" style={vars({ '--ip-i': 0 })}>
                  고르는 대로
                </span>
              </span>
            </Mask>
            <Mask>
              <span className="ip-slide block" style={vars({ '--ip-dx': '9vw' })}>
                <span className="ip-enter block" style={vars({ '--ip-i': 1 })}>
                  계산됩니다
                </span>
              </span>
            </Mask>
          </h1>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            {/* 사양 줄: 장식이 아니라 이 견적이 다루는 실제 값이다(카탈로그에서 읽는다). */}
            <SceneBlock>
              <dl className="m-0 grid grid-cols-2 gap-x-10 gap-y-3 sm:grid-cols-4">
                {SPECS.map(([name, value]) => (
                  <div key={name} className="flex flex-col-reverse gap-1">
                    <dt className="text-muted-foreground text-caption">{name}</dt>
                    <dd className="m-0 text-xl font-semibold tracking-tight tabular-nums">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </SceneBlock>
            <SceneBlock className="ip-float max-w-md" style={vars({ '--ip-float': '60px' })}>
              <p className="text-muted-foreground text-body">
                트림부터 색상, 휠, 내장까지 고르면 선택할 수 있는 항목과 가격이 즉시 계산됩니다.
                차량은 선택을 그대로 따라 바뀌고, 마우스나 터치로 끌어서 돌려 볼 수 있습니다.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild radius="pill" size="xlarge">
                  <Link href={startHref}>견적 시작하기</Link>
                </Button>
                <Button asChild radius="pill" size="xlarge" variant="secondary">
                  <Link href="#intro-trim">둘러보기</Link>
                </Button>
              </div>
              <p className="text-muted-foreground text-caption">
                BMW와 무관한 포트폴리오이며 가격과 사양은 모두 가상의 값입니다.
              </p>
            </SceneBlock>
          </div>
        </HeroFrame>

        <SceneFrame
          id="intro-trim"
          text={
            <SceneText
              eyebrow="트림"
              title="트림에 따라 선택지가 달라집니다"
              lead="스포트는 20·21인치 휠과 무광 도장 같은 항목을 열어 줍니다. 컴포트로 돌아가면 고를 수 없게 된 항목은 자동으로 바뀌고, 무엇이 바뀌었는지 문장으로 알려 드립니다."
            />
          }
          controls={
            <SceneControls>
              <IntroChoiceGroup slot="trim" legend="트림" selection={selection} onChoose={choose} />
              <IntroNoticeSlot notice={notices.trim} />
            </SceneControls>
          }
        />

        <SceneFrame
          id="intro-color"
          text={
            <SceneText
              eyebrow="외장 색상"
              title="외장 색상을 고르면 차량이 바로 칠해집니다"
              lead="색마다 가격이 다르고, 지금 사양에서 고를 수 없는 색은 이유와 함께 표시됩니다."
            />
          }
          controls={
            <SceneControls>
              <SceneValue label="선택한 색">
                <TextRoll direction={rolls.color}>{labelOf('color', selection.color)}</TextRoll>
              </SceneValue>

              <IntroColorGroup selection={selection} onChoose={choose} />
              <IntroNoticeSlot notice={notices.color} />
            </SceneControls>
          }
        />

        <SceneFrame
          id="intro-wheel"
          text={
            <SceneText
              eyebrow="휠"
              title="휠 크기도 바로 반영됩니다"
              lead="카메라가 앞바퀴로 다가가 림과 타이어의 변화를 보여 드립니다. 큰 휠은 트림과 파워트레인 조건을 만족해야 고를 수 있습니다."
            />
          }
          controls={
            <SceneControls>
              <SceneValue label="휠 크기">
                {/* 숫자 두 자리만 넘기는 판. 한글 글리프가 없는 컴포넌트라 숫자에만 쓰고, 단위는 옆에 일반 글자로 둔다. */}
                <span className="inline-flex items-baseline gap-3">
                  <SplitFlapText
                    text={String(WHEEL_INCH[selection.wheel])}
                    charset="numeric"
                    padTo={2}
                    intro={false}
                    fontSize="1em"
                    tileColor="var(--muted)"
                    textColor="var(--foreground)"
                    aria-label={`${WHEEL_INCH[selection.wheel]}인치`}
                  />
                  <span aria-hidden className="text-muted-foreground text-2xl">
                    인치
                  </span>
                </span>
              </SceneValue>

              <IntroChoiceGroup slot="wheel" legend="휠" selection={selection} onChoose={choose} />
              <IntroNoticeSlot notice={notices.wheel} />
            </SceneControls>
          }
        />

        <SceneFrame
          id="intro-interior"
          text={
            <SceneText
              eyebrow="내장 색상"
              title="내장 색상은 운전석 시점에서 확인합니다"
              lead="외장 색에 어울리는 조합만 고를 수 있습니다. 실내는 모델의 기본 형태에 색만 비슷하게 맞춰 보여 드립니다."
            />
          }
          controls={
            <SceneControls>
              <SceneValue label="선택한 내장">
                <TextRoll direction={rolls.interior}>
                  {labelOf('interior', selection.interior)}
                </TextRoll>
              </SceneValue>

              <IntroChoiceGroup
                slot="interior"
                legend="내장 색상"
                selection={selection}
                onChoose={choose}
              />
              <IntroNoticeSlot notice={notices.interior} />
            </SceneControls>
          }
        />

        <SceneFrame
          id="intro-price"
          text={
            <SceneText
              eyebrow="가격"
              title={
                <>
                  <span className="sr-only">선택한 사양의 총 예상 금액</span>
                  {/* 큰 숫자가 곧 제목이다. 읽어 주는 글자는 위의 sr-only와 `IntroApp`의 상태 영역이 맡는다. */}
                  <span aria-hidden className="block text-6xl lg:text-7xl">
                    <Counter
                      value={quote.total}
                      prefix="₩"
                      locale="ko-KR"
                      fontSize="1em"
                      fontWeight={600}
                    />
                  </span>
                </>
              }
              lead="소비자가에 취득세와 부대비용을 더한 총액입니다. 세금 공식은 포트폴리오용으로 단순화한 가상 규칙입니다."
            />
          }
          controls={
            <SceneControls>
              <IntroPrice quote={quote} />
            </SceneControls>
          }
        />

        <SceneFrame
          id="intro-start"
          text={
            <SceneText
              eyebrow="출발"
              title="지금 고른 사양으로 출발하십시오"
              lead="여기서 고른 선택이 견적 화면에 그대로 이어집니다. 시트와 선택 품목, 액세서리는 다음 단계에서 고르실 수 있고, 모든 선택은 주소에 담겨 공유할 수 있습니다."
            />
          }
          controls={
            <SceneAction>
              <Button asChild radius="pill" size="xlarge">
                <Link href={startHref}>견적 시작하기</Link>
              </Button>
            </SceneAction>
          }
        />
      </main>

      {/* 넓은 화면에서는 고정된 차량(z-10)이 화면을 덮으므로, 바닥글이 그 위(z-20)에 배경을 깔고 놓인다. */}
      <footer className="border-border bg-background text-muted-foreground text-caption relative z-0 flex flex-col gap-2 border-t px-5 pt-8 pb-20 lg:z-20 lg:px-12">
        <p>비공식 포트폴리오입니다. BMW와 무관하며 가격과 사양은 모두 가상의 값입니다.</p>
        <details>
          <summary className="focus-visible:ring-ring cursor-pointer rounded-sm underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none">
            3D 모델 출처와 고지
          </summary>
          <div className="mt-2 flex flex-col gap-1">
            <p>
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
            <p>수정: {VEHICLE.credit.changes}</p>
            <p>{VEHICLE.credit.trademark}</p>
          </div>
        </details>
      </footer>

      {/* 총액 변화를 알린다. 화면의 큰 숫자(`Counter`)는 스크린 리더에서 숨겨져 있어서 이 영역이 읽어 준다. */}
      <p role="status" className="sr-only">
        총 예상 금액 {formatWon(quote.total)}
      </p>
      <IntroRail active={active} />
    </div>
  );
}
