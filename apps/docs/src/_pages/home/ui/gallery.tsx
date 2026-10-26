'use client';

import { AnimatedAmount } from '@repo/ui/animated-amount';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { CopyButton } from '@repo/ui/copy-button';
import { Segmented, SegmentedItem } from '@repo/ui/segmented';
import { SwitchField } from '@repo/ui/switch-field';
import { TextRoll } from '@repo/ui/text-roll';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';

function GalleryCard({
  title,
  description,
  href,
  className,
  children,
}: {
  title: string;
  description: string;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article
      className={`border-border bg-card flex min-w-0 flex-col overflow-hidden rounded-xl border ${className ?? ''}`}
    >
      <div className="flex min-h-40 flex-1 items-center justify-center p-6">{children}</div>
      <div className="border-border min-h-32 border-t p-5">
        <h3 className="m-0 text-base font-semibold">
          <Link
            className="hover:text-primary focus-visible:outline-primary rounded-sm no-underline outline-offset-4 focus-visible:outline-2"
            href={href}
          >
            {title}
          </Link>
        </h3>
        <p className="text-muted-foreground mt-1.5 mb-0 text-sm leading-6">{description}</p>
      </div>
    </article>
  );
}

const STEPS = ['모델', '외장 색상', '휠', '시트', '내장', '견적 결과'];
const AMOUNTS = [90_000_000, 91_500_000, 93_200_000, 95_700_000];

function RollDemo() {
  const [index, setIndex] = useState(0);
  // 글자 수가 다른 이름으로 바뀌어도 위치가 좌우로 움직이지 않게 폭을 고정하고 왼쪽 정렬한다.
  return (
    <div className="flex w-44 flex-col items-start gap-4">
      <p className="m-0 text-2xl font-semibold tracking-tight">
        <span className="sr-only">{index + 1}단계: </span>
        <TextRoll direction="up">{STEPS[index] ?? ''}</TextRoll>
      </p>
      <Button
        size="small"
        variant="secondary"
        onClick={() => {
          setIndex((value) => (value + 1) % STEPS.length);
        }}
      >
        다음 단계
      </Button>
    </div>
  );
}

function AmountDemo() {
  const [index, setIndex] = useState(0);
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="m-0 text-2xl font-semibold tracking-tight tabular-nums">
        <AnimatedAmount value={AMOUNTS[index] ?? 0} />
      </p>
      <Button
        size="small"
        variant="secondary"
        onClick={() => {
          setIndex((value) => (value + 1) % AMOUNTS.length);
        }}
      >
        옵션 담기
      </Button>
    </div>
  );
}

function SegmentedDemo() {
  const [value, setValue] = useState('wheel');
  return (
    <Segmented aria-label="시점" className="w-full max-w-xs" value={value} onValueChange={setValue}>
      {['외관', '휠', '시트', '대시보드'].map((label, index) => (
        <SegmentedItem
          key={label}
          className="flex-1"
          value={['exterior', 'wheel', 'seat', 'dash'][index] ?? label}
        >
          {label}
        </SegmentedItem>
      ))}
    </Segmented>
  );
}

/** 컴포넌트 갤러리. 카드마다 실제 컴포넌트를 눌러 볼 수 있다. */
export function Gallery() {
  const [sunroof, setSunroof] = useState(false);
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <GalleryCard
        description="알약이 선택된 항목 뒤에서 미끄러집니다. 속은 네이티브 라디오라 방향키가 그대로 됩니다."
        href="/docs/components/segmented"
        title="세그먼트"
      >
        <SegmentedDemo />
      </GalleryCard>
      <GalleryCard
        description="스위치와 이름표를 한 라벨로 묶고, 상태 글자만 굴러서 바뀝니다."
        href="/docs/components/switch-field"
        title="스위치 필드"
      >
        <SwitchField
          checked={sunroof}
          label="선루프 열어 보기"
          status={{ on: '열림', off: '닫힘' }}
          onChange={(event) => {
            setSunroof(event.target.checked);
          }}
        />
      </GalleryCard>
      <GalleryCard
        description="글자가 바뀔 때 이전 글자가 밀려 나가고 새 글자가 따라 들어옵니다."
        href="/docs/components/text-roll"
        title="글자 롤"
      >
        <RollDemo />
      </GalleryCard>
      <GalleryCard
        description="금액이 바뀌면 숫자가 굴러서 바뀝니다. 폭이 고정돼 주변이 흔들리지 않습니다."
        href="/docs/components/animated-amount"
        title="애니메이티드 금액"
      >
        <AmountDemo />
      </GalleryCard>
      <GalleryCard
        description="누르면 값이 복사되고 체크 표시가 한 번 그려집니다."
        href="/docs/components/copy-button"
        title="복사 버튼"
      >
        <CopyButton label="견적 코드 복사" value="GCW95KC" />
      </GalleryCard>
      <GalleryCard
        description="기본, 보조, 맑은 변형과 크기, 모서리를 고를 수 있고 눌림은 같은 규칙을 따릅니다."
        href="/docs/components/button"
        title="버튼"
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button variant="primary">견적 저장</Button>
          <Button variant="secondary">비교함 담기</Button>
          <Badge>상담 대기</Badge>
        </div>
      </GalleryCard>
    </div>
  );
}
