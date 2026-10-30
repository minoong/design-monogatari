import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ComponentProps, useState } from 'react';

import { PackageRow } from './package-row';
import { noControls, textControls } from './storybook/arg-types';

const meta = {
  title: '컴포넌트/패키지 행',
  component: PackageRow,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`PackageRow`는 여러 옵션을 묶은 선택 품목 한 줄입니다. 네이티브 체크박스라서 스페이스로 켜고 끄고, `items`를 주면 "구성 보기" 버튼으로 구성 항목을 펼칩니다. 다른 패키지에 포함돼 이미 체크된 항목에는 `includedIn`으로 사실을 적습니다. 체크 해제는 막지 않으니 호출하는 쪽이 패키지를 푸는 확인 안내를 띄우십시오.',
      },
    },
  },
  args: {
    label: '파퓰러 패키지',
    description: '드라이빙 어시스턴스와 헤드업 디스플레이를 함께 담았습니다.',
    price: '+₩3,600,000',
    items: ['드라이빙 어시스턴스', '헤드업 디스플레이'],
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    ...textControls('label', 'description', 'price', 'includedIn'),
    ...noControls('items'),
  },
} satisfies Meta<typeof PackageRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 선택됨: Story = { args: { defaultChecked: true } };

export const 구성없음: Story = {
  name: '구성 항목 없음',
  args: {
    label: '파노라마 선루프',
    description: undefined,
    price: '+₩1,800,000',
    items: undefined,
  },
};

export const 포함됨: Story = {
  args: {
    label: '헤드업 디스플레이',
    description: undefined,
    price: '포함',
    items: undefined,
    checked: true,
    readOnly: true,
    includedIn: '파퓰러 패키지에 포함',
  },
};

function ControlledPackage(props: ComponentProps<typeof PackageRow>) {
  const [checked, setChecked] = useState(false);
  return (
    <PackageRow
      {...props}
      checked={checked}
      onChange={(event) => setChecked(event.target.checked)}
    />
  );
}

export const 제어됨: Story = {
  name: '제어 컴포넌트',
  render: (args) => <ControlledPackage {...args} />,
};
