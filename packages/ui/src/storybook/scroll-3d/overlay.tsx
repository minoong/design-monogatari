import { Button } from '../../button';
import { cn } from '../../lib/cn';
import { PAINT_CHECK, PAINT_SWATCHES, type PaintId } from './paints';
import { vehicleById, type VehicleId, VEHICLES } from './vehicles';

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

export function SequenceOverlay({
  engine,
  kind,
  paintId,
  onPaintId,
  vehicleId,
  onVehicleId,
  oem = false,
  onResetView,
  onZoomIn,
  onZoomOut,
}: {
  engine: string;
  kind: string;
  paintId?: PaintId;
  onPaintId?: (id: PaintId) => void;
  vehicleId?: VehicleId;
  onVehicleId?: (id: VehicleId) => void;
  oem?: boolean;
  onResetView?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}) {
  const credit = vehicleId ? vehicleById(vehicleId).credit : undefined;
  const showPaint = Boolean(paintId && onPaintId && !oem);
  const inspect = Boolean(onResetView && onZoomIn && onZoomOut);
  const caption =
    oem && vehicleId === 'xc40'
      ? `${kind} · 도장 맵이 없어 Glacier Silver로 복원합니다.`
      : oem
        ? `${kind} · 원본 머티리얼입니다.`
        : `${kind} · 도장 hex는 테마와 무관해요.`;

  return (
    <>
      <p className="text-muted-foreground text-caption">{engine}</p>
      <h2 className="text-title font-semibold tracking-tight">
        {inspect ? '드래그해서 돌려요' : '스크롤하면 돌아요'}
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
      {vehicleId && onVehicleId ? (
        <div className="mt-3" role="radiogroup" aria-label="차종">
          <p className="text-muted-foreground text-caption mb-2">차종</p>
          <div className="flex flex-wrap gap-2">
            {VEHICLES.map((vehicle) => {
              const selected = vehicle.id === vehicleId;

              return (
                <button
                  key={vehicle.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={cn(
                    'text-caption rounded-md px-3 py-1.5',
                    selected
                      ? 'bg-foreground text-background'
                      : 'text-foreground ring-border ring-1',
                  )}
                  onClick={() => {
                    onVehicleId(vehicle.id);
                  }}
                >
                  {vehicle.label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      {credit ? (
        <p className="text-muted-foreground text-caption mt-2 line-clamp-2">
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
        </p>
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
