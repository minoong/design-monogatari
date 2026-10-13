'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { motion } from 'motion/react';
import { useRef, useState } from 'react';

import { Button } from '../button';
import { useCheckPhase } from '../lib/check-phase';
import { DURATION, EASE, SPRING, STAGGER } from '../lib/motion';
import { StoryReplay } from '../story-replay';
import { TokenStack } from './catalog-row';
import { DocBody, DocCode, DocPage, DocSection } from './doc-page';

const DURATION_NOTES: Record<keyof typeof DURATION, string> = {
  instant: '감소 모션, 눈에 띄지 않는 전환',
  fast: '호버, 눌림 같은 즉각 반응',
  base: '선택, 상태 변화',
  slow: '목록, 섹션 진입',
  hero: '화면당 한 번의 큰 연출',
};

function DurationBars() {
  const [played, setPlayed] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button size="small" onClick={() => setPlayed((value) => !value)}>
          재생
        </Button>
      </div>
      <TokenStack>
        {(Object.keys(DURATION) as (keyof typeof DURATION)[]).map((name) => (
          <div key={name} className="grid grid-cols-[9rem_1fr] items-center gap-3 text-sm">
            <span className="flex flex-col">
              <code className="text-xs">DURATION.{name}</code>
              <span className="text-muted-foreground text-xs tabular-nums">
                {DURATION[name]}s · {DURATION_NOTES[name]}
              </span>
            </span>
            <span className="bg-muted relative h-6 overflow-hidden rounded-full">
              <motion.span
                className="bg-primary absolute inset-y-0 left-0 w-full origin-left"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: played ? 1 : 0 }}
                transition={{ duration: DURATION[name], ease: EASE.outExpo }}
              />
            </span>
          </div>
        ))}
      </TokenStack>
    </div>
  );
}

function SpringBalls() {
  const [right, setRight] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button size="small" onClick={() => setRight((value) => !value)}>
          이동
        </Button>
      </div>
      {(Object.keys(SPRING) as (keyof typeof SPRING)[]).map((name) => (
        <div key={name} className="grid grid-cols-[9rem_1fr] items-center gap-3 text-sm">
          <code className="text-xs">SPRING.{name}</code>
          <span className="bg-muted relative h-6 w-60 rounded-full">
            <motion.span
              className="bg-primary absolute top-1 left-1 size-4 rounded-full"
              animate={{ x: right ? 200 : 0 }}
              transition={SPRING[name]}
            />
          </span>
        </div>
      ))}
      <p className="text-muted-foreground text-caption">
        STAGGER: fast {STAGGER.fast}s · base {STAGGER.base}s · slow {STAGGER.slow}s
      </p>
    </div>
  );
}

function DemoChip({
  checked,
  label,
  onSelect,
}: {
  checked: boolean;
  label: string;
  onSelect: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const phase = useCheckPhase(checked, inputRef);

  return (
    <label className="relative inline-flex size-9 cursor-pointer">
      <input
        ref={inputRef}
        type="radio"
        name="motion-pop-demo"
        checked={checked}
        onChange={onSelect}
        aria-label={label}
        className="peer sr-only"
      />
      <span
        aria-hidden
        data-phase={phase}
        className="bg-muted border-border peer-checked:ring-primary peer-checked:ring-offset-background peer-focus-visible:outline-ring after:border-primary motion-safe:data-[phase=in]:animate-select-pop motion-safe:data-[phase=out]:after:animate-select-out relative size-9 rounded-full border peer-checked:ring-2 peer-checked:ring-offset-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 after:pointer-events-none after:absolute after:-inset-1.5 after:rounded-full after:border-2 after:opacity-0 after:content-['']"
      />
    </label>
  );
}

function PopDemo() {
  const [value, setValue] = useState('a');

  return (
    <div className="flex gap-4" role="radiogroup" aria-label="선택 반응 시연">
      {['a', 'b', 'c'].map((item) => (
        <DemoChip
          key={item}
          label={`칩 ${item}`}
          checked={value === item}
          onSelect={() => setValue(item)}
        />
      ))}
    </div>
  );
}

function Motion() {
  return (
    <DocPage
      kicker="파운데이션"
      title="모션"
      lead="움직임은 상태가 바뀌었다는 알림입니다. 시간, 곡선, 스프링을 @repo/ui/motion 토큰으로 한 곳에 모으고, 감소 모션을 기본으로 지킵니다."
    >
      <DocSection title="규칙">
        <DocBody>
          상태 변화(선택, 진입, 이동, 로딩)에만 움직임을 붙입니다. opacity와 transform만 움직이고,
          화면당 큰 연출은 하나입니다. useReducedMotion으로 이동을 없애고 짧은 페이드만 남기며,
          Motion과 Tailwind transition을 같은 요소에 쓰지 않습니다.
        </DocBody>
        <DocCode>{`import { DURATION, EASE, SPRING } from '@/lib/motion';

<motion.div
  initial={{ opacity: 0, y: 12 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: DURATION.slow, ease: EASE.outExpo }}
/>`}</DocCode>
      </DocSection>

      <DocSection title="시간">
        <DurationBars />
      </DocSection>

      <DocSection title="스프링">
        <SpringBalls />
      </DocSection>

      <DocSection title="선택과 해제 반응 (animate-select-pop, animate-select-out)">
        <DocBody>
          칩을 눌러 보십시오. 선택되는 순간 0.6배에서 1.12배를 거쳐 1배로 돌아오고, 다른 칩으로
          옮기면 이전 칩의 링이 줄어들며 사라집니다. 처음 그려질 때와 감소 모션에서는 움직이지
          않습니다.
        </DocBody>
        <StoryReplay>
          <PopDemo />
        </StoryReplay>
      </DocSection>
    </DocPage>
  );
}

const meta = {
  title: '파운데이션/모션',
  component: Motion,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Motion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 토큰: Story = {};
