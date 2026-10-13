'use client';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { type ReactNode } from 'react';

import { ThreeGltfDemo } from './storybook/scroll-3d/three-gltf';

function StoryShell({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <p className="text-muted-foreground text-caption px-6 py-16">
        시퀀스가 끝나면 여기로 내려옵니다.
      </p>
    </div>
  );
}

const meta = {
  title: '컴포넌트/스크롤3D',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Storybook용 Three.js 3D 차량입니다. 이미지 시퀀스(`ScrollImageSequence`)가 아니라 GLTF입니다. 도장 스토리는 GSAP 핀으로 스크롤 회전합니다. 원본 스토리는 드래그 회전·스크롤 줌입니다. 실내는 시트·스티어링·트림을 포함합니다. 칩 hex는 라이트·다크에서 같고, 범퍼는 도장에 맞춘 플라스틱 톤입니다. ' +
          '차량 모델: BMW X5 G05 (2018), BMW Car IT, CC BY 4.0 (https://github.com/bmwcarit/digital-car-3d). 원본에서 수정했습니다: 반쪽 메시 미러링·조립, 앞유리 투과 처리, 크기·방향 정렬, 도장 스토리의 도장 색 교체. ' +
          'BMW, X5와 BMW 엠블럼은 BMW AG의 상표이며, 이 프로젝트는 BMW와 제휴·후원 관계가 없습니다(상표권은 CC BY 4.0에 포함되지 않습니다). ' +
          'Renault/Plus360에서 긁은 메쉬는 넣지 않습니다. `@repo/ui` public API·레지스트리가 아닙니다. Motion을 WebGL 캔버스에 넣지 마십시오.',
      },
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const ThreeGLTF: Story = {
  name: 'Three GLTF',
  render: () => (
    <StoryShell>
      <ThreeGltfDemo />
    </StoryShell>
  ),
};

export const X5원본: Story = {
  name: 'X5 원본',
  render: () => (
    <StoryShell>
      <ThreeGltfDemo oem vehicleId="x5" />
    </StoryShell>
  ),
};
