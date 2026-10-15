import type { Meta, StoryObj } from '@storybook/react-vite';

import { ChangeDiff } from './change-diff';
import { noControls, textControls } from './storybook/arg-types';

const meta = {
  title: '컴포넌트/변경 비교',
  component: ChangeDiff,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`ChangeDiff`는 선택을 바꾸면 무엇이 달라지는지 이전 선택과 변경 후를 두 열로 보여 줍니다. 파워트레인을 바꾸면 휠이 되돌아가는 것처럼 다른 선택이 함께 바뀔 때 확인 모달 안에 넣어 쓰십시오. 추가·삭제·변경은 색이 아니라 글자 표식으로 구분하고, 비어 있는 칸은 "없음"이라고 읽힙니다. 시맨틱 `table`이라 스크린 리더가 행과 열 이름을 함께 읽습니다.',
      },
    },
  },
  args: {
    rows: [
      { label: '휠', before: '20인치 알로이 휠', after: '19인치 기본 휠' },
      { label: '외장 색상', before: '브론즈', after: '화이트' },
      { label: '선택 품목', before: '스카이 라운지 루프', after: undefined },
      { label: '액세서리', before: undefined, after: '빌트인 블랙박스' },
    ],
    summary: '-3,100,000원',
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    ...textControls('summary'),
    ...noControls('rows', 'statusLabels'),
  },
} satisfies Meta<typeof ChangeDiff>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 합계없음: Story = {
  name: '합계 없음',
  args: { summary: undefined },
};

export const 한줄: Story = {
  name: '한 항목만',
  args: {
    rows: [{ label: '시트', before: '5인승', after: '4인승 독립 시트' }],
    summary: '+3,000,000원',
  },
};
