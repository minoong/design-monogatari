import type { Meta, StoryObj } from '@storybook/react-vite';

import { DataTable, type DataTableColumn } from './data-table';
import { noControls } from './storybook/arg-types';

type Fee = { region: string; delivery: number; registration: number };

const FEES: readonly Fee[] = [
  { region: '서울', delivery: 450_000, registration: 180_000 },
  { region: '부산', delivery: 520_000, registration: 165_000 },
  { region: '제주', delivery: 910_000, registration: 140_000 },
];

const won = (value: number) => `${new Intl.NumberFormat('ko-KR').format(value)}원`;

const COLUMNS: readonly DataTableColumn<Fee>[] = [
  { key: 'region', header: '탁송 지역', rowHeader: true },
  { key: 'delivery', header: '탁송료', numeric: true, cell: (row) => won(row.delivery) },
  { key: 'registration', header: '등록비', numeric: true, cell: (row) => won(row.registration) },
];

const meta = {
  title: '컴포넌트/데이터 표',
  component: DataTable<Fee>,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`DataTable`은 부대비용·등록비처럼 행과 열로 읽는 자료를 보여 주는 시맨틱 표입니다. 표 이름(`caption`)이 필수이고 행 이름 열은 `th scope="row"`로 그려집니다. 숫자 칸은 줄바꿈하지 않고, 좁은 화면에서 표가 넘치면 가로로 스크롤되며 키보드로 초점을 받을 수 있습니다.',
      },
    },
  },
  args: {
    caption: '지역별 탁송료와 등록비',
    columns: COLUMNS,
    rows: FEES,
    getRowKey: (row: Fee) => row.region,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-lg">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    ...noControls('columns', 'rows', 'getRowKey', 'footer'),
    caption: { control: 'text' },
  },
} satisfies Meta<typeof DataTable<Fee>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 합계줄: Story = {
  name: '합계 줄',
  args: {
    footer: { region: '서울 기준 합계', delivery: won(450_000), registration: won(180_000) },
  },
};

export const 이름숨김: Story = {
  name: '표 이름 숨김',
  args: { captionHidden: true },
};
