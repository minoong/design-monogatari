'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { ThreeGltfDemo } from './storybook/vehicle-3d/three-gltf';

/** 차량 3D 데모 2개: 앱이 쓰는 웹용 모델과, 비교용 원본 모델. 둘 다 드래그로 돌리고 스크롤로 확대한다. */
const meta = {
  title: '컴포넌트/차량 3D',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    // 이 데모에는 조절할 props가 없다. 자동 생성되는 속성 표(자리 표시 행)를 문서에서 뺀다.
    controls: { disable: true },
    docs: {
      controls: { disable: true },
      description: {
        component: [
          '`@repo/vehicle-3d`의 Three.js 뷰어를 Storybook 크롬(도장 칩, 줌 버튼, 크레딧)으로 감싼 데모입니다. `@repo/ui`의 공개 API도 레지스트리 항목도 아닙니다.',
          '',
          '- 드래그하면 차가 돌고 스크롤하면 확대됩니다. 페이지 스크롤과 연동된 회전은 없습니다.',
          '- 왼쪽 위 오버레이에서 도장 색을 바꾸거나 "원본 색"으로 되돌립니다.',
          '- 오버레이의 "시점"에서 외관, 휠, 시트, 대시보드를 고르면 카메라가 부드럽게 옮겨 갑니다. 시트와 대시보드는 차 안에서 제자리로 둘러보는 실내 시점이라 확대는 없습니다. 실내는 모델의 기본 구성이고 도장 색은 반영되지 않습니다. 감소 모션이면 바로 옮겨 갑니다.',
          '',
          '| 모델 | 설명 |',
          '| --- | --- |',
          '| 웹용 | 앱이 쓰는 압축본(6.5MB, 엠블럼 없음). `apps/web/public/models/g05-web/` |',
          '| 원본 | 압축하기 전 원본(40MB). `pnpm --filter @repo/ui copy:car` 필요, 정적 빌드에는 들어가지 않습니다. |',
          '',
          '모델은 BMW Car IT의 BMW X5 G05(CC BY 4.0)입니다. 제작자·출처·수정 사항·상표 안내는 화면 하단의 크레딧과 루트 `NOTICE`에 있습니다. Motion을 WebGL 캔버스에 넣지 마십시오.',
        ].join('\n'),
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const 웹용: Story = {
  name: '웹용 모델',
  parameters: {
    docs: { description: { story: '앱이 쓰는 압축 모델입니다. 엠블럼 부품이 없습니다.' } },
  },
  render: () => <ThreeGltfDemo vehicleId="x5-web" />,
};

export const 원본: Story = {
  name: '원본 모델 (로컬 전용)',
  parameters: {
    docs: {
      description: {
        story: '압축 전 원본입니다. 웹용과 같게 보여야 합니다. 엠블럼 부품이 있습니다.',
      },
    },
  },
  render: () => <ThreeGltfDemo vehicleId="x5" />,
};

export const 휠: Story = {
  name: '휠 시점',
  parameters: {
    docs: {
      description: {
        story:
          '앞바퀴에 가까이 간 시점입니다. 림과 브레이크가 보입니다. 다른 시점에서 시작해 "휠"을 누르면 카메라가 이쪽으로 옮겨 옵니다.',
      },
    },
  },
  render: () => <ThreeGltfDemo initialView="wheel" vehicleId="x5-web" />,
};

export const 시트: Story = {
  name: '실내: 시트 시점',
  parameters: {
    docs: {
      description: {
        story:
          '앞좌석 사이에서 뒤쪽을 봅니다. 앞좌석, 뒷좌석, 천장이 한눈에 들어옵니다. 드래그하면 제자리에서 둘러봅니다.',
      },
    },
  },
  render: () => <ThreeGltfDemo initialView="seats" vehicleId="x5-web" />,
};

export const 대시보드: Story = {
  name: '실내: 대시보드 시점',
  parameters: {
    docs: {
      description: {
        story: '운전자 눈높이에서 앞을 봅니다. 대시보드와 핸들이 보입니다.',
      },
    },
  },
  render: () => <ThreeGltfDemo initialView="dashboard" vehicleId="x5-web" />,
};
