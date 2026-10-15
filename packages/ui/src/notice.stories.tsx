import type { Meta, StoryObj } from '@storybook/react-vite';

import { Notice, NoticeDescription, NoticeTitle } from './notice';

const meta = {
  title: '컴포넌트/안내',
  component: Notice,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Notice`는 화면 안에 머무는 안내와 오류 문구입니다. 정보는 `role="status"`로 조용히, 오류는 `role="alert"`로 즉시 읽힙니다. 면책 문구, 선택이 자동으로 바뀐 이유처럼 사라지면 안 되는 내용에 쓰고, 잠깐 보였다 사라지는 알림은 `Toast`를 쓰십시오. 오류는 색뿐 아니라 굵은 테두리와 제목 색으로도 구분됩니다.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: { control: 'inline-radio', options: ['info', 'error'] },
  },
} satisfies Meta<typeof Notice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 정보: Story = {
  render: () => (
    <Notice>
      <NoticeTitle>휠이 기본 휠로 바뀌었습니다</NoticeTitle>
      <NoticeDescription>
        선택하신 트림에서는 20인치 알로이 휠을 고를 수 없어 19인치 기본 휠로 되돌렸습니다.
      </NoticeDescription>
    </Notice>
  ),
};

export const 오류: Story = {
  render: () => (
    <Notice variant="error">
      <NoticeTitle>탁송지를 선택해 주십시오</NoticeTitle>
      <NoticeDescription>견적을 완료하려면 탁송 지역이 필요합니다.</NoticeDescription>
    </Notice>
  ),
};

export const 면책문구: Story = {
  name: '면책 문구',
  render: () => (
    <Notice>
      <NoticeDescription>
        이 견적은 포트폴리오용 가상 데이터이며 BMW와 무관합니다. 실제 가격과 사양은 다를 수
        있습니다.
      </NoticeDescription>
    </Notice>
  ),
};
