import type { Meta, StoryObj } from '@storybook/react-vite';

import { IconButton } from './icon-button';
import { ArrowRightIcon } from './icons/arrow-right';
import { HeartIcon } from './icons/heart';
import { PlusIcon } from './icons/plus';

const meta = {
  title: '컴포넌트/아이콘버튼',
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`IconButton`은 아이콘만으로 액션을 전달할 때 사용합니다. `aria-label`은 필수입니다. 기본 모서리는 `md`(둥근 사각형)이고, 기본 형태는 `clear`(잉크 아이콘)입니다. 누르면 `whileTap`으로 0.9배 줄고 옅은 워시가 덮습니다. 아이콘과 텍스트를 같이 쓸 때는 `Button`을 써 주십시오.',
      },
    },
  },
  args: {
    'aria-label': '관심 차량 담기',
    children: <HeartIcon />,
  },
  argTypes: {
    children: { control: false },
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'clear'] },
    size: { control: 'inline-radio', options: ['small', 'medium', 'large', 'xlarge'] },
    radius: { control: 'inline-radio', options: ['md', 'lg', 'pill'] },
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 투명: Story = {};

export const 채움: Story = {
  args: {
    variant: 'primary',
    'aria-label': '추가',
    children: <PlusIcon />,
  },
};

export const 테두리: Story = {
  args: {
    variant: 'secondary',
    'aria-label': '다음',
    children: <ArrowRightIcon />,
  },
};

export const 형태: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <IconButton aria-label="추가">
        <PlusIcon />
      </IconButton>
      <IconButton aria-label="추가" variant="primary">
        <PlusIcon />
      </IconButton>
      <IconButton aria-label="추가" variant="secondary">
        <PlusIcon />
      </IconButton>
    </div>
  ),
};

export const 크기: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <IconButton aria-label="관심 차량 담기" size="small" variant="primary">
        <HeartIcon />
      </IconButton>
      <IconButton aria-label="관심 차량 담기" size="medium" variant="primary">
        <HeartIcon />
      </IconButton>
      <IconButton aria-label="관심 차량 담기" size="large" variant="primary">
        <HeartIcon />
      </IconButton>
      <IconButton aria-label="관심 차량 담기" size="xlarge" variant="primary">
        <HeartIcon />
      </IconButton>
    </div>
  ),
};

export const 로딩: Story = {
  args: {
    variant: 'primary',
    loading: true,
    'aria-label': '추가',
    children: <PlusIcon />,
  },
};

export const 비활성화: Story = {
  args: {
    disabled: true,
    'aria-label': '관심 차량 담기',
    children: <HeartIcon />,
  },
};
