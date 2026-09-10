import type { Meta, StoryObj } from '@storybook/react';

import { Button } from './button';
import { ArrowRightIcon } from './icons/arrow-right';
import { PlusIcon } from './icons/plus';

const meta = {
  title: '컴포넌트/버튼',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Button`은 액션을 실행할 때 사용해요. 중요한 일은 채운 버튼, 한 단계 낮은 일은 헤어라인 테두리 버튼이에요. 모서리는 `radius`(`md` / `lg` / `pill`)예요. 누르면 Motion `whileTap`으로 살짝 줄어요. 채운 버튼은 검정 딤, 테두리·투명은 옅은 잉크 워시예요. 호버로는 커지지 않아요.',
      },
    },
  },
  args: {
    children: '다음에 하기',
    variant: 'secondary',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 보조: Story = {};

export const 주요: Story = {
  args: {
    variant: 'primary',
    children: '확인',
  },
};

export const 크기: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="small">작은</Button>
      <Button size="medium">중간</Button>
      <Button size="large">큰</Button>
      <Button size="xlarge">아주 큰</Button>
    </div>
  ),
};

export const 형태: Story = {
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button display="inline">나란히</Button>
        <Button display="inline" variant="primary">
          확인
        </Button>
      </div>
      <Button display="block">한 줄 전체</Button>
      <div className="flex">
        <Button display="full" variant="primary">
          부모를 채움
        </Button>
      </div>
    </div>
  ),
};

export const 모서리: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button radius="md" variant="primary">
        md
      </Button>
      <Button radius="lg" variant="primary">
        lg
      </Button>
      <Button radius="pill" variant="primary">
        pill
      </Button>
    </div>
  ),
};

export const 아이콘과텍스트: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary">
          <PlusIcon data-icon="inline-start" />
          추가
        </Button>
        <Button>
          <PlusIcon data-icon="inline-start" />
          추가
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="small" variant="primary">
          <PlusIcon data-icon="inline-start" />
          추가
        </Button>
        <Button size="medium" variant="primary">
          <PlusIcon data-icon="inline-start" />
          추가
        </Button>
        <Button size="large" variant="primary">
          <PlusIcon data-icon="inline-start" />
          추가
        </Button>
        <Button size="xlarge" variant="primary">
          <PlusIcon data-icon="inline-start" />
          추가
        </Button>
      </div>
    </div>
  ),
};

export const 텍스트와아이콘: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="primary">
        다음
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
      <Button>
        다음
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </div>
  ),
};

export const 로딩: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: '확인',
  },
};

export const 비활성화: Story = {
  args: {
    disabled: true,
    children: '다음에 하기',
  },
};

export const 로딩과비활성화: Story = {
  args: {
    variant: 'primary',
    loading: true,
    disabled: true,
    children: '확인',
  },
};

export const 링크: Story = {
  render: () => (
    <Button asChild variant="primary">
      <a href="#다음">다음으로</a>
    </Button>
  ),
};
