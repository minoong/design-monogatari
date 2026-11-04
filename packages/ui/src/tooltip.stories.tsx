import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';
import { IconButton } from './icon-button';
import { DownloadIcon } from './icons/download';
import { HeartIcon } from './icons/heart';
import { PlusIcon } from './icons/plus';
import { PrinterIcon } from './icons/printer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

/** 컨트롤로 바꿔 볼 수 있는 값. 툴팁은 부분(`Tooltip`, `TooltipTrigger`, `TooltipContent`)을 조합하므로 화면에서 쓰는 값만 뽑았다. */
type TooltipArgs = {
  text: string;
  side: 'top' | 'right' | 'bottom' | 'left';
  delayDuration: number;
};

const meta = {
  title: '컴포넌트/툴팁',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Tooltip`은 글자 없는 컨트롤(아이콘 버튼)에 이름을 보여 주는 짧은 말풍선입니다. 마우스를 올리거나 키보드 포커스가 들어오면 열리고, Esc나 클릭으로 닫힙니다. 앱 최상위를 `TooltipProvider`로 감싸 열림 지연(기본 400ms)을 정하면, 하나가 열린 뒤 300ms 안에 옆 항목으로 옮길 때는 지연 없이 바로 열립니다. 터치에서는 열리지 않으므로 중요한 정보를 여기에만 두지 마십시오.',
      },
    },
  },
  args: { text: '관심 차량 담기', side: 'top', delayDuration: 400 },
  argTypes: {
    text: { control: 'text' },
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    delayDuration: { control: { type: 'number', min: 0, step: 100 } },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="flex min-h-40 items-center justify-center p-8">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
} satisfies Meta<TooltipArgs>;

export default meta;

type Story = StoryObj<TooltipArgs>;

export const 기본: Story = {
  render: ({ text, side, delayDuration }) => (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>
        <IconButton aria-label={text}>
          <HeartIcon />
        </IconButton>
      </TooltipTrigger>
      <TooltipContent side={side}>{text}</TooltipContent>
    </Tooltip>
  ),
};

export const 방향: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`side`로 열리는 방향을 정합니다. 화면 끝에서는 자리가 모자라면 반대쪽으로 뒤집힙니다(`collisionPadding` 8px).',
      },
    },
  },
  render: () => (
    <div className="flex gap-6">
      {(
        [
          ['top', '위'],
          ['right', '오른쪽'],
          ['bottom', '아래'],
          ['left', '왼쪽'],
        ] as const
      ).map(([side, label]) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant="secondary">{label}</Button>
          </TooltipTrigger>
          <TooltipContent side={side}>{label}에 열립니다</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

export const 줄지은버튼: Story = {
  name: '줄지어 선 버튼',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '첫 항목은 400ms 뒤에 열리고, 그 직후 옆 버튼으로 옮기면 지연 없이 바로 열립니다(`skipDelayDuration` 300ms). 움직임도 없이 바로 보여 훑어보기 편합니다.',
      },
    },
  },
  render: () => (
    <div className="flex gap-1">
      {[
        { label: '차량 이미지 저장', icon: <DownloadIcon /> },
        { label: '인쇄 · PDF 저장', icon: <PrinterIcon /> },
        { label: '관심 차량 담기', icon: <HeartIcon /> },
        { label: '견적에 담기', icon: <PlusIcon /> },
      ].map((item) => (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>
            <IconButton aria-label={item.label}>{item.icon}</IconButton>
          </TooltipTrigger>
          <TooltipContent>{item.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

export const 긴문장: Story = {
  name: '긴 문장',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: '말풍선 최대 너비는 `max-w-xs`(20rem)이고 긴 문장은 줄바꿈됩니다.',
      },
    },
  },
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="secondary">취득세 안내</Button>
      </TooltipTrigger>
      <TooltipContent>
        취득세는 차량 가격에서 부가세를 뺀 공급가액의 7%로 계산하며, 원 미만은 버립니다. 실제 금액은
        등록 지역과 과세 구분에 따라 달라질 수 있습니다.
      </TooltipContent>
    </Tooltip>
  ),
};

export const 비활성버튼: Story = {
  name: '비활성 버튼',
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '비활성 버튼은 포인터와 포커스를 받지 못해 트리거로 쓸 수 없습니다. 임시 방법으로, 포커스를 받는 `span`으로 감싸 그 `span`을 트리거로 씁니다(우리 포커스 링을 직접 줍니다). 터치에서는 말풍선이 열리지 않으므로 이유는 버튼 아래에 글자로도 보입니다.',
      },
    },
  },
  render: () => (
    <div className="flex flex-col items-start gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className="focus-visible:ring-ring focus-visible:ring-offset-background inline-flex rounded-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden"
            /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- 비활성 버튼은 포커스를 받지 못해, 감싼 span이 대신 받는다 */
            tabIndex={0}
          >
            <Button disabled variant="secondary">
              차량 이미지 저장
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>차량 모델을 불러오는 중이라 아직 저장할 수 없습니다</TooltipContent>
      </Tooltip>
      <p className="text-muted-foreground text-caption m-0">차량 모델을 불러오는 중입니다.</p>
    </div>
  ),
};
