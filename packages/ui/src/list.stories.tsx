import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Button } from './button';
import { List, ListItem } from './list';
import { StoryReplay } from './story-replay';
import { noControls } from './storybook/arg-types';

const meta = {
  title: '컴포넌트/목록',
  component: List,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '`List`는 항목이 위에서 아래로 40ms 간격으로 차례로 나타나는 목록입니다. 첫 그림에서만 재생하고, 나중에 추가된 항목은 지연 없이 나타납니다(감소 모션이면 이동 없이 짧게 나타납니다). `selectable`을 켜면 항목 하나를 고르는 `listbox`가 됩니다: Tab으로 목록에 들어가 방향키·Home·End·글자 입력으로 옮겨 다니고, Enter 또는 Space로 고릅니다. 선택은 오른쪽 체크 표시로도 알립니다. 끄면 선택 없이 보여주기만 하는 `list`입니다. 첫 화면 위쪽에 있는 내용에는 쓰지 마십시오: 자바스크립트가 실행되기 전까지 항목이 숨겨져 있습니다.',
      },
    },
  },
  args: {
    'aria-label': '포함 사양',
    children: null,
  },
  argTypes: {
    ...noControls('children', 'value', 'defaultValue', 'onValueChange'),
    stagger: { control: { type: 'number', min: 0, max: 0.3, step: 0.01 } },
  },
} satisfies Meta<typeof List>;

export default meta;

type Story = StoryObj<typeof meta>;

const wrap = (Story: () => React.JSX.Element) => (
  <div className="w-full max-w-md">
    <Story />
  </div>
);

export const 기본: Story = {
  name: '기본 (보여주기만)',
  render: (args) => (
    <StoryReplay>
      <List stagger={args.stagger} selectable={false}>
        <ListItem>어댑티브 LED 헤드라이트</ListItem>
        <ListItem>파노라마 글라스 루프</ListItem>
        <ListItem>어댑티브 M 서스펜션</ListItem>
        <ListItem>하만카돈 사운드 시스템</ListItem>
      </List>
    </StoryReplay>
  ),
  decorators: [wrap],
};

export const 선택: Story = {
  name: '선택 (listbox)',
  render: (args) => (
    <StoryReplay>
      <List stagger={args.stagger} selectable aria-label="내장 색상" defaultValue="black">
        <ListItem value="black">블랙 비건 가죽</ListItem>
        <ListItem value="cognac">코냑 비건 가죽</ListItem>
        <ListItem value="ivory">아이보리 화이트</ListItem>
        <ListItem value="tartufo">타르투포 (재고 없음)</ListItem>
      </List>
    </StoryReplay>
  ),
  decorators: [wrap],
};

export const 비활성항목: Story = {
  name: '비활성 항목',
  render: (args) => (
    <StoryReplay>
      <List stagger={args.stagger} selectable aria-label="휠" defaultValue="19">
        <ListItem value="19">19인치 기본 휠</ListItem>
        <ListItem value="20">20인치 M 라이트 알로이</ListItem>
        <ListItem value="21" disabled>
          21인치 알로이 (스포트 트림 전용)
        </ListItem>
        <ListItem value="22">22인치 단조 휠</ListItem>
      </List>
    </StoryReplay>
  ),
  decorators: [wrap],
};

export const 제어: Story = {
  name: '제어 (value)',
  render: function Render(args) {
    const [value, setValue] = useState('diesel');
    const labels: Record<string, string> = {
      diesel: '디젤 xDrive30d',
      gasoline: '가솔린 xDrive40i',
      hybrid: '플러그인 하이브리드 xDrive50e',
    };
    return (
      <StoryReplay>
        <List
          stagger={args.stagger}
          selectable
          aria-label="파워트레인"
          value={value}
          onValueChange={setValue}
        >
          {Object.entries(labels).map(([key, label]) => (
            <ListItem key={key} value={key}>
              {label}
            </ListItem>
          ))}
        </List>
        <p className="text-muted-foreground text-caption">선택: {labels[value]}</p>
      </StoryReplay>
    );
  },
  decorators: [wrap],
};

export const 항목추가: Story = {
  name: '항목 추가 (지연 없이 등장)',
  render: function Render(args) {
    const [count, setCount] = useState(3);
    return (
      <div className="flex flex-col gap-3">
        <List stagger={args.stagger} aria-label="견적 메모">
          {Array.from({ length: count }, (_, index) => (
            <ListItem key={index}>견적 메모 {index + 1}</ListItem>
          ))}
        </List>
        <Button
          variant="secondary"
          size="small"
          className="self-start"
          onClick={() => {
            setCount((current) => current + 1);
          }}
        >
          메모 추가
        </Button>
      </div>
    );
  },
  decorators: [wrap],
};
