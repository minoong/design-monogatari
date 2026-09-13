'use client';

import type { Meta, StoryObj } from '@storybook/react';
import { type ReactNode } from 'react';

import { ThreeGltfDemo } from './storybook/scroll-3d/three-gltf';

function StoryShell({ children }: { children: ReactNode }) {
  return (
    <div>
      {children}
      <p className="text-muted-foreground text-caption px-6 py-16">
        시퀀스가 끝나면 여기로 내려와요.
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
          'Storybook용 Three.js 3D 차량입니다. 이미지 시퀀스(`ScrollImageSequence`)가 아니라 GLTF·FBX입니다. 도장 스토리는 GSAP 핀으로 스크롤 회전합니다. 원본 스토리는 드래그 회전·스크롤 줌입니다. X5 실내는 시트·스티어링·트림을 포함합니다. XC40 키트는 Glacier Silver 도장 맵을 안 실어 재질 이름으로 복원합니다. 칩 hex는 라이트·다크에서 같고, 범퍼는 도장에 맞춘 플라스틱 톤입니다. 차종은 BMW Car IT X5 G05(CC BY 4.0)와 Volvo XC40 Recharge(Volvo EULA, 비상업)입니다. Renault/Plus360에서 긁은 메쉬는 넣지 않습니다. `@repo/ui` public API·레지스트리가 아닙니다. Motion을 WebGL 캔버스에 넣지 마세요.',
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

export const XC40원본: Story = {
  name: 'XC40 원본',
  render: () => (
    <StoryShell>
      <ThreeGltfDemo oem vehicleId="xc40" />
    </StoryShell>
  ),
};
