import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './button';
import { ArrowRightIcon } from './icons/arrow-right';
import { CheckIcon } from './icons/check';
import { PlusIcon } from './icons/plus';
import { XIcon } from './icons/x';
import { StoryReplay } from './story-replay';

const meta = {
  title: '컴포넌트/버튼',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Button`은 액션을 실행할 때 사용합니다. 중요한 일은 채운 버튼, 한 단계 낮은 일은 헤어라인 테두리 버튼입니다. 모서리는 `radius`(`md` / `lg` / `pill`)입니다. 누르면 Motion `whileTap`으로 살짝 줍니다. 채운 버튼은 검정 딤, 테두리·투명은 옅은 잉크 워시입니다. 호버로는 커지지 않습니다.',
      },
    },
  },
  args: {
    children: '다음에 하기',
    variant: 'secondary',
  },
  // react-docgen이 CVA 옵션을 읽지 못하므로 컨트롤을 직접 정한다.
  argTypes: {
    children: { control: 'text' },
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'clear'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large', 'xlarge'] },
    radius: { control: 'inline-radio', options: ['md', 'lg', 'pill'] },
    icon: { control: 'boolean' },
    type: { control: 'inline-radio', options: ['button', 'submit', 'reset'] },
    display: { control: 'inline-radio', options: ['inline', 'block', 'full'] },
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

export const 눌림: Story = {
  name: '눌림(토글)',
  parameters: {
    docs: {
      description: {
        story:
          '`aria-pressed`를 주면 `secondary`가 프라이머리 테두리와 링으로 켜진 상태를 보입니다. 글자는 그대로 두고 상태만 바꾸십시오.',
      },
    },
  },
  render: () => (
    <div className="flex gap-2">
      <Button aria-pressed={true} size="small" variant="secondary">
        휠
      </Button>
      <Button aria-pressed={false} size="small" variant="secondary">
        시트
      </Button>
    </div>
  ),
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

export const 아이콘_한_번: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`iconMotion="mount"`는 버튼이 나타날 때 아이콘이 한 번만 움직이고, 마우스를 올리거나 포커스가 와도 다시 움직이지 않습니다. 다이얼로그 푸터나 안내의 닫기 버튼에 씁니다. 오른쪽 위 버튼으로 다시 볼 수 있습니다.',
      },
    },
  },
  render: () => (
    <StoryReplay>
      <div className="flex flex-wrap items-center gap-2">
        <Button iconMotion="mount" variant="secondary">
          <XIcon data-icon="inline-start" />
          취소
        </Button>
        <Button iconMotion="mount" variant="primary">
          <CheckIcon data-icon="inline-start" />
          변경 확인
        </Button>
      </div>
    </StoryReplay>
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
