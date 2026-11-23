'use client';

import { ColorSwatchGroup } from '@repo/ui/color-swatch-group';
import { type CSSProperties, useState } from 'react';

import { ESTIMATE_COLORS } from '../estimate-colors';
import { Stage } from './stage';
import { SuvWebgl } from './suv-webgl';

/**
 * 컴포넌트 구역의 장면: 실제 `ColorSwatchGroup`에서 색을 고르면 WebGL SUV의 차체 점이 그 색으로 바뀐다.
 * 컴포넌트는 색을 정하지 않고 값을 받기만 하고, 화면은 그 값을 따라간다는 것을 보여 준다.
 */
export function ScenePaint() {
  const [color, setColor] = useState<string>('blue');
  const item = ESTIMATE_COLORS.find((entry) => entry.value === color) ?? ESTIMATE_COLORS[0];

  return (
    <Stage
      caption="외장 색상을 고르면 SUV 차체의 점 색이 바뀝니다"
      file="color-swatch-group.tsx"
      grow={false}
    >
      <div className="grid items-center gap-6 p-4 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:gap-10 md:p-8">
        <div className="lp-float min-w-0" style={{ '--lp-float': '18px' } as CSSProperties}>
          <ColorSwatchGroup
            legend="외장 색상"
            name="lab-paint"
            options={ESTIMATE_COLORS.map((entry) => ({
              value: entry.value,
              label: entry.label,
              color: entry.color,
              group: entry.group,
              price: entry.price,
            }))}
            value={color}
            onValueChange={setColor}
          />
        </div>
        <div
          className="lp-float flex min-w-0 flex-col gap-3"
          data-lp-stage
          style={{ '--lp-float': '-18px' } as CSSProperties}
        >
          <div aria-label={`${item.label} 도장의 가상 SUV 옆모습`} role="img">
            <SuvWebgl paint={item.color} />
          </div>
          <p aria-live="polite" className="text-muted-foreground m-0 text-center font-mono text-xs">
            {item.label} · {item.group} · {item.price}
          </p>
        </div>
      </div>
    </Stage>
  );
}
