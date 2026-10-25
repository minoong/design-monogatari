import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';

import { Label } from './label';
import { noControls } from './storybook/arg-types';
import { Switch } from './switch';

const meta = {
  title: '컴포넌트/스위치',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '켜고 끄는 한 가지 설정에 쓰는 스위치입니다. 네이티브 체크박스에 `role="switch"`를 달았기 때문에 스페이스로 켜고 끄고 폼으로 값이 전송되며, 스크린 리더는 "스위치, 켜짐/꺼짐"으로 읽습니다. 누르는 동안 손잡이가 켜짐 쪽으로 늘어났다가 놓으면 돌아오고(마우스, 스페이스, 연결된 `Label`을 누를 때 확인했고, 터치는 기기에 따라 다를 수 있습니다), 감소 모션이면 바로 바뀝니다. 이름표는 `Label`을 `htmlFor`로 이어 주거나 `aria-label`을 주십시오. 여러 개를 켜고 끄는 선택 항목에는 `Checkbox`나 `PackageRow`를 쓰십시오.',
      },
    },
  },
  argTypes: {
    ...noControls('id', 'name', 'value', 'defaultChecked', 'checked', 'onChange'),
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

function LabelledSwitch({
  label,
  className,
  ...args
}: React.ComponentProps<typeof Switch> & { label: string }) {
  // 문서 페이지에 스토리가 여러 개 놓이므로 id를 스토리마다 따로 만든다(같은 id면 라벨이 첫 스위치를 켠다).
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <Switch {...args} id={id} />
      <Label htmlFor={id} className={className}>
        {label}
      </Label>
    </div>
  );
}

export const 기본: Story = {
  render: (args) => <LabelledSwitch {...args} label="견적 알림 받기" />,
};

export const 켜짐: Story = {
  args: { defaultChecked: true },
  render: 기본.render,
};

export const 비활성: Story = {
  render: (args) => (
    <div className="flex flex-col gap-3">
      <LabelledSwitch
        {...args}
        disabled
        label="재고 알림 (준비 중)"
        className="text-muted-foreground"
      />
      <LabelledSwitch
        {...args}
        disabled
        defaultChecked
        label="기본 포함 옵션"
        className="text-muted-foreground"
      />
    </div>
  ),
};

export const 오류: Story = {
  args: { 'aria-invalid': true },
  render: (args) => <LabelledSwitch {...args} label="약관 동의가 필요합니다" />,
};

function Controlled(args: React.ComponentProps<typeof Switch>) {
  const [on, setOn] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <LabelledSwitch
        {...args}
        label="다크 테마 미리 보기"
        checked={on}
        onChange={(event) => {
          setOn(event.target.checked);
        }}
      />
      <p className="text-muted-foreground text-caption">상태: {on ? '켜짐' : '꺼짐'}</p>
    </div>
  );
}

export const 제어됨: Story = {
  render: (args) => <Controlled {...args} />,
};

export const 이름표_없음: Story = {
  name: '이름표 없음 (aria-label)',
  args: { 'aria-label': '견적 알림 받기' },
  render: (args) => <Switch {...args} />,
};
