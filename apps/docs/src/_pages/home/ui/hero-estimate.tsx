'use client';

import { AnimatedAmount } from '@repo/ui/animated-amount';
import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { ColorSwatchGroup } from '@repo/ui/color-swatch-group';
import { OptionGroup, OptionRow } from '@repo/ui/option-row';
import { Segmented, SegmentedItem } from '@repo/ui/segmented';
import { SwitchField } from '@repo/ui/switch-field';
import { useState } from 'react';

const BASE_PRICE = 90_000_000;

// 데모용 색과 가격입니다. 실제 차량 정보가 아니며, 컴포넌트는 색을 정하지 않고 `color`로 받습니다.
const COLORS = [
  {
    value: 'white',
    label: '화이트',
    color: '#f2f2f0',
    group: '글로시',
    price: '기본 포함',
    extra: 0,
  },
  {
    value: 'black',
    label: '블랙',
    color: '#1a1a1c',
    group: '글로시',
    price: '기본 포함',
    extra: 0,
  },
  { value: 'blue', label: '블루', color: '#27406b', group: '글로시', price: '기본 포함', extra: 0 },
  {
    value: 'pearl',
    label: '펄 화이트',
    color: '#e8e6df',
    group: '메탈릭',
    price: '+1,000,000원',
    extra: 1_000_000,
  },
  {
    value: 'bronze',
    label: '브론즈',
    color: '#7a5c3e',
    group: '메탈릭',
    price: '+1,000,000원',
    extra: 1_000_000,
  },
] as const;

const WHEELS = [
  { value: 'w19', label: '19인치 기본 휠', price: '기본 포함', extra: 0 },
  { value: 'w20', label: '20인치 알로이 휠', price: '+1,500,000원', extra: 1_500_000 },
  { value: 'w21', label: '21인치 알로이 휠', price: '+3,200,000원', extra: 3_200_000 },
] as const;

const VIEWS = [
  { value: 'exterior', label: '외관' },
  { value: 'wheel', label: '휠' },
  { value: 'seat', label: '시트' },
] as const;

/** 히어로 안의 견적 카드. 실제 컴포넌트를 조합했고, 눌러 보면 금액이 바뀐다. */
export function HeroEstimate() {
  const [color, setColor] = useState<string>('white');
  const [wheel, setWheel] = useState<string>('w19');
  const [view, setView] = useState<string>('exterior');
  const [sunroof, setSunroof] = useState(false);
  const [saved, setSaved] = useState(false);

  const colorItem = COLORS.find((item) => item.value === color) ?? COLORS[0];
  const wheelItem = WHEELS.find((item) => item.value === wheel) ?? WHEELS[0];
  const total = BASE_PRICE + colorItem.extra + wheelItem.extra;

  return (
    <div className="border-border bg-background/90 mx-auto grid w-full max-w-4xl gap-6 rounded-xl border p-4 text-left backdrop-blur-sm md:grid-cols-[1.15fr_1fr] md:p-6">
      <div className="flex min-w-0 flex-col gap-5">
        <ColorSwatchGroup
          legend="외장 색상"
          name="landing-color"
          options={COLORS.map((item) => ({
            value: item.value,
            label: item.label,
            color: item.color,
            group: item.group,
            price: item.price,
          }))}
          value={color}
          onValueChange={(next) => {
            setColor(next);
            setSaved(false);
          }}
        />
        <OptionGroup legend="휠">
          {WHEELS.map((item) => (
            <OptionRow
              key={item.value}
              checked={wheel === item.value}
              label={item.label}
              name="landing-wheel"
              price={item.price}
              value={item.value}
              onChange={() => {
                setWheel(item.value);
                setSaved(false);
              }}
            />
          ))}
        </OptionGroup>
      </div>
      <div className="border-border bg-card flex min-w-0 flex-col gap-4 rounded-lg border p-4 md:pt-6">
        <div className="flex items-center justify-between gap-2">
          <p className="m-0 text-sm font-medium">X5 견적 예시</p>
          <Badge>데모</Badge>
        </div>
        <Segmented aria-label="카메라 시점" className="w-full" value={view} onValueChange={setView}>
          {VIEWS.map((item) => (
            <SegmentedItem key={item.value} className="flex-1" value={item.value}>
              {item.label}
            </SegmentedItem>
          ))}
        </Segmented>
        <SwitchField
          checked={sunroof}
          label="선루프 열어 보기"
          status={{ on: '열림', off: '닫힘' }}
          onChange={(event) => {
            setSunroof(event.target.checked);
          }}
        />
        <dl className="text-muted-foreground m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt>외장</dt>
          <dd className="text-foreground m-0 text-right">{colorItem.label}</dd>
          <dt>휠</dt>
          <dd className="text-foreground m-0 text-right">{wheelItem.label}</dd>
          <dt>시점</dt>
          <dd className="text-foreground m-0 text-right">
            {VIEWS.find((item) => item.value === view)?.label}
          </dd>
          <dt>선루프</dt>
          <dd className="text-foreground m-0 text-right">{sunroof ? '열림' : '닫힘'}</dd>
        </dl>
        <div className="border-border mt-auto border-t pt-4">
          <p className="text-muted-foreground m-0 text-xs">예상 견적 금액</p>
          <p className="m-0 mt-1 text-2xl font-semibold tracking-tight tabular-nums">
            <AnimatedAmount value={total} />
          </p>
          <Button
            className="mt-4 w-full"
            display="block"
            variant="primary"
            onClick={() => {
              setSaved(true);
            }}
          >
            {saved ? '견적을 저장했습니다' : '견적 저장'}
          </Button>
        </div>
      </div>
    </div>
  );
}
