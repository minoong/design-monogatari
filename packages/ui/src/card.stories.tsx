import type { Meta, StoryObj } from '@storybook/react-vite';

import { Card, CardDescription, CardHeader, CardTitle } from './card';

const meta = {
  title: '컴포넌트/카드',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Card`는 관련 정보를 한 덩어리로 묶어 줄 때 사용합니다. 그림자는 올리지 않고, 헤어라인 테두리로 면을 나눠 주십시오. `CardHeader` · `CardTitle` · `CardDescription`을 조합합니다.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>견적 안내</CardTitle>
        <CardDescription>
          취득세와 부대비용은 지역과 과세 구분에 따라 다릅니다. 계약 전에 한 번 더 확인해 주십시오.
        </CardDescription>
      </CardHeader>
    </Card>
  ),
};
