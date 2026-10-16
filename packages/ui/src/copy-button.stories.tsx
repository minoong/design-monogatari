import type { Meta, StoryObj } from '@storybook/react-vite';

import { CopyButton } from './copy-button';

const meta = {
  title: '컴포넌트/복사 버튼',
  component: CopyButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`CopyButton`은 글자를 클립보드에 복사하는 버튼입니다. 누르면 문구가 "복사했습니다"로 바뀌었다가 돌아오고, 같은 문구를 스크린 리더에 조용히 알립니다. 클립보드를 쓸 수 없으면 "복사하지 못했습니다"로 바뀝니다. 문구가 바뀌어도 버튼 너비는 변하지 않습니다. 복사한 뒤 `Toast`를 띄우려면 `onCopy`를 쓰십시오.',
      },
    },
  },
  args: {
    value: 'https://example.com/estimate?v=1&c=GCW95KC',
    label: '링크 복사',
  },
  argTypes: {
    value: { control: 'text' },
    label: { control: 'text' },
    copiedLabel: { control: 'text' },
    failedLabel: { control: 'text' },
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'clear'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large', 'xlarge'] },
  },
} satisfies Meta<typeof CopyButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 주요: Story = {
  args: { variant: 'primary', label: '견적 링크 복사' },
};

export const 아이콘만: Story = {
  name: '아이콘만',
  args: {
    iconOnly: true,
    variant: 'secondary',
    label: '견적 코드 복사',
    value: 'GCW95KC',
    size: 'small',
  },
  parameters: {
    docs: {
      description: {
        story:
          '`iconOnly`는 글자 없이 정사각형 아이콘 버튼으로 보입니다. 문구는 화면에서만 숨기고 접근성 이름으로는 그대로 쓰므로 복사하면 "복사했습니다"로 바뀌어 읽힙니다.',
      },
    },
  },
};

export const 작은크기: Story = {
  name: '작은 크기',
  args: { size: 'small', variant: 'clear', label: '코드 복사', value: 'GCW95KC' },
};

export const 빠른복귀: Story = {
  name: '빠른 복귀',
  args: { resetDelay: 800 },
};
