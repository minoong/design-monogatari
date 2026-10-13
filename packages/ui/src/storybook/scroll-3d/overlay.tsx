'use client';

import { PAINT_CHECK, PAINT_SWATCHES, type PaintId } from '@repo/vehicle-3d/paints';
import { vehicleById, type VehicleId } from '@repo/vehicle-3d/vehicles';
import { useState } from 'react';

import { Button } from '../../button';

function PaintCheckIcon() {
  return (
    <svg aria-hidden className="size-3" fill="none" viewBox="0 0 12 12">
      <path
        d="M2.2 6.2 4.8 8.7 9.8 3.3"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

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
  oem = false,
  onResetView,
  onZoomIn,
  onZoomOut,
}: {
  engine: string;
  kind: string;
  paintId?: PaintId;
  onPaintId?: (id: PaintId) => void;
  oem?: boolean;
  onResetView?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}) {
  const showPaint = Boolean(paintId && onPaintId && !oem);
  const inspect = Boolean(onResetView && onZoomIn && onZoomOut);
  const caption = oem
    ? `${kind} · 원본 머티리얼입니다.`
    : `${kind} · 도장 hex는 테마와 무관합니다.`;

  return (
    <>
      <p className="text-muted-foreground text-caption">{engine}</p>
      <h2 className="text-title font-semibold tracking-tight">
        {inspect ? '드래그해서 돌립니다' : '스크롤하면 돕니다'}
      </h2>
      <p className="text-caption text-muted-foreground mt-1">{caption}</p>
      {inspect && onResetView && onZoomIn && onZoomOut ? (
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
      ) : null}
      {showPaint && paintId && onPaintId ? (
        <div className="mt-3" role="radiogroup" aria-label="도장">
          <p className="text-muted-foreground text-caption mb-2">도장</p>
          <div className="flex max-w-56 flex-wrap gap-1.5">
            {PAINT_SWATCHES.map((swatch) => {
              const selected = swatch.id === paintId;

              return (
                <button
                  key={swatch.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={swatch.label}
                  className="focus-visible:ring-ring relative size-8 shrink-0 overflow-visible rounded-sm focus-visible:ring-2 focus-visible:outline-none"
                  onClick={() => {
                    onPaintId(swatch.id);
                  }}
                >
                  <span
                    className="border-border absolute inset-0 overflow-hidden rounded-sm border"
                    style={{ backgroundColor: swatch.hex }}
                  >
                    <span
                      className="pointer-events-none absolute inset-0"
                      style={{
                        backgroundImage:
                          'linear-gradient(135deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0) 42%, rgba(0,0,0,0.22) 100%)',
                      }}
                    />
                  </span>
                  {selected ? (
                    <span
                      className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full"
                      style={{ backgroundColor: PAINT_CHECK }}
                    >
                      <PaintCheckIcon />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}
