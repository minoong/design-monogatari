import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { noControls } from './storybook/arg-types';
import { SwitchField } from './switch-field';

const meta = {
  title: '컴포넌트/스위치 필드',
  component: SwitchField,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`Switch`와 이름표를 한 `label`로 묶어서 스위치와 글자 사이 간격까지 눌리게 한 조합입니다. 높이는 32px라서 옆의 작은 버튼과 맞고, 이름은 상태와 상관없이 고정입니다(상태에 따라 이름표 글자가 바뀌면 낭독기가 이름과 상태를 어긋나게 읽고 음성 제어에서도 이름이 어긋납니다). 상태를 글자로도 보이고 싶으면 `status`를 줍니다: 켜면 위로, 끄면 아래로 굴러서 바뀌고, 스위치가 이미 알리므로 낭독기에는 읽히지 않습니다. 나머지 속성은 스위치로 가고 `className`은 바깥 `label`에 붙습니다.',
      },
    },
  },
  args: { label: '선루프 열어 보기' },
  argTypes: {
    ...noControls('status', 'name', 'value', 'defaultChecked', 'checked', 'onChange', 'id'),
  },
} satisfies Meta<typeof SwitchField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const 기본: Story = {};

export const 상태_글자: Story = {
  name: '상태 글자 (status)',
  args: { status: { on: '열림', off: '닫힘' } },
};

export const 켜짐: Story = {
  args: { defaultChecked: true, status: { on: '열림', off: '닫힘' } },
};

export const 비활성: Story = {
  args: { disabled: true, label: '재고 알림 (준비 중)' },
};

function Controlled() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <SwitchField
        label="선루프 열어 보기"
        status={{ on: '열림', off: '닫힘' }}
        checked={open}
        onChange={(event) => {
          setOpen(event.target.checked);
        }}
      />
      <p className="text-muted-foreground text-caption">상태: {open ? '열림' : '닫힘'}</p>
    </div>
  );
}

export const 제어됨: Story = {
  render: () => <Controlled />,
};
