'use client';

import { PAINT_SWATCHES, type PaintId } from '@repo/vehicle-3d/paints';
import { vehicleById, type VehicleId } from '@repo/vehicle-3d/vehicles';
import { useState } from 'react';

import { Button } from '../../button';
import { ColorSwatchGroup, type ColorSwatchOption } from '../../color-swatch-group';

const ORIGINAL_PAINT = 'original';

const PAINT_OPTIONS: readonly ColorSwatchOption[] = [
  // 모델이 원래 가진 색. 칠하지 않은 상태라 고정 색 대신 테마 전경색을 반쯤 섞은 중간 회색으로 표시한다. 흰색·검정 칩과 겹쳐 보이지 않게 한다.
  {
    value: ORIGINAL_PAINT,
    label: '원본 색',
    color: 'color-mix(in srgb, var(--color-foreground) 50%, transparent)',
  },
  ...PAINT_SWATCHES.map((swatch) => ({
    value: swatch.id,
    label: swatch.label,
    color: swatch.hex,
  })),
];

/**
 * CC BY 4.0 notice for the vehicle model (see `vehicles.ts` `credit`). One line is always
 * visible: source, creator, license, warranty disclaimer, "modified" and the trademark
 * disclaimer. The full modification and trademark text opens above it on demand and is also in
 * `.storybook/public/models/README.md`.
 */
export function VehicleCredit({ vehicleId }: { vehicleId: VehicleId }) {
  const { credit } = vehicleById(vehicleId);
  const [open, setOpen] = useState(false);

  return (
    <div className="text-muted-foreground space-y-1">
      {open ? (
        <div className="max-w-sm space-y-1" id="vehicle-credit-detail">
          <p>수정: {credit.changes}</p>
          <p>{credit.trademark}</p>
        </div>
      ) : null}
      <p>
        <a
          className="underline underline-offset-2"
          href={credit.href}
          rel="noreferrer"
          target="_blank"
        >
          {credit.work}
        </a>
        {' · '}
        {credit.by}
        {' · '}
        <a
          className="underline underline-offset-2"
          href={credit.licenseHref}
          rel="noreferrer"
          target="_blank"
        >
          {credit.license}
        </a>
        {' · '}
        <a
          className="whitespace-nowrap underline underline-offset-2"
          href={credit.disclaimerHref}
          rel="noreferrer"
          target="_blank"
        >
          보증 부인
        </a>
        {' · 수정됨 · BMW와 무관 · '}
        <button
          aria-controls={open ? 'vehicle-credit-detail' : undefined}
          aria-expanded={open}
          className="focus-visible:ring-ring rounded-sm whitespace-nowrap underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none"
          type="button"
          onClick={() => {
            setOpen((value) => !value);
          }}
        >
          {open ? '접기' : '고지 전문'}
        </button>
      </p>
    </div>
  );
}

export function SequenceOverlay({
  engine,
  kind,
  paintId,
  onPaintId,
  onResetView,
  onZoomIn,
  onZoomOut,
}: {
  engine: string;
  kind: string;
  /** null 이면 모델 원래 색 */
  paintId: PaintId | null;
  onPaintId: (id: PaintId | null) => void;
  onResetView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}) {
  return (
    <>
      <p className="text-muted-foreground text-caption">{engine}</p>
      <h2 className="text-title font-semibold tracking-tight">드래그해서 돌립니다</h2>
      <p className="text-caption text-muted-foreground mt-1">
        {kind} · {paintId ? '도장 hex는 테마와 무관합니다.' : '원본 머티리얼입니다.'}
      </p>
      <div className="mt-3">
        <p className="text-muted-foreground text-caption mb-2">보기</p>
        <div className="flex flex-wrap gap-1.5">
          <Button size="small" type="button" variant="secondary" onClick={onZoomIn}>
            줌 인
          </Button>
          <Button size="small" type="button" variant="secondary" onClick={onZoomOut}>
            줌 아웃
          </Button>
          <Button size="small" type="button" variant="secondary" onClick={onResetView}>
            리셋
          </Button>
        </div>
      </div>
      <ColorSwatchGroup
        className="mt-3 max-w-56"
        legend="도장"
        name="vehicle-paint"
        options={PAINT_OPTIONS}
        value={paintId ?? ORIGINAL_PAINT}
        onValueChange={(value) => {
          onPaintId(value === ORIGINAL_PAINT ? null : (value as PaintId));
        }}
      />
    </>
  );
}
