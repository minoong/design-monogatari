'use client';

import { Button } from '@repo/ui/button';
import { cn } from '@repo/ui/cn';
import { ArrowDownIcon } from '@repo/ui/icons/arrow-down';
import { ArrowLeftIcon } from '@repo/ui/icons/arrow-left';
import { ArrowRightIcon } from '@repo/ui/icons/arrow-right';
import { ArrowUpIcon } from '@repo/ui/icons/arrow-up';
import { MaximizeIcon } from '@repo/ui/icons/maximize';
import { MinimizeIcon } from '@repo/ui/icons/minimize';
import { RotateCCWIcon } from '@repo/ui/icons/rotate-ccw';
import { SunIcon, type SunIconHandle } from '@repo/ui/icons/sun';
import { Skeleton, SkeletonGroup } from '@repo/ui/skeleton';
import { vehicleById } from '@repo/vehicle-3d/vehicles';
import type { InspectHandle } from '@repo/vehicle-3d/viewer';
import {
  CAMERA_CONTROL_LABELS,
  CAMERA_VIEWS,
  type CameraViewId,
  INSIDE_VIEW_NOTE,
} from '@repo/vehicle-3d/views';
import dynamic from 'next/dynamic';
import { Component, type ReactNode, useEffect, useRef, useState } from 'react';

import { caliperSwatchOf } from '../model/caliper-map';
import { CATALOG } from '../model/catalog';
import { interiorSwatchOf } from '../model/interior-map';
import { paintSwatchOf } from '../model/paint-map';
import { rimFinishSwatchOf } from '../model/rim-map';
import { SUNROOF_PACKAGES } from '../model/roof-map';
import { isInsideView, STAGE_VIEW_OPTIONS, stageViewOf } from '../model/stage-view';
import type { StepId } from '../model/steps';
import type { CaliperId, ColorId, InteriorId, RimFinishId, WheelId } from '../model/types';
import { WHEEL_INCH } from '../model/wheel-map';

const VEHICLE = vehicleById('x5-web');

/** 선루프가 보이게 하는 선택 품목 이름. 카탈로그에서 읽어서 이름이 바뀌어도 캡션이 어긋나지 않는다. */
const SUNROOF_LABELS = CATALOG.package
  .filter((item) => SUNROOF_PACKAGES.some((id) => id === item.id))
  .map((item) => item.label)
  .join(', ');

const VehicleViewer = dynamic(() => import('./vehicle-viewer'), {
  ssr: false,
  loading: () => <StageLoading />,
});

function StageLoading() {
  return (
    <SkeletonGroup label="차량 모델을 불러오는 중입니다" className="absolute inset-0">
      <Skeleton className="absolute inset-4 rounded-lg" />
    </SkeletonGroup>
  );
}

/** WebGL을 쓸 수 없거나 모델을 그리다 실패하면 이 안내와 색 견본이 대신 보인다. */
function StageFallback({ hex, label }: { hex: string; label: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
      <span
        aria-hidden
        className="border-border size-16 rounded-full border"
        style={{ backgroundColor: hex }}
      />
      <p className="text-foreground text-sm font-medium">선택한 색: {label}</p>
      <p className="text-muted-foreground text-caption">
        이 환경에서는 3D 차량을 보여 드릴 수 없습니다. 선택과 견적은 그대로 사용할 수 있습니다.
      </p>
    </div>
  );
}

class ViewerBoundary extends Component<
  { fallback: ReactNode; children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** 차량 아래 설명과 3D 모델 출처 고지. CC BY 4.0이라 모델을 보여 주는 곳에 늘 있어야 한다. */
function StageNotesBody() {
  return (
    <>
      <span>
        비공식 포트폴리오입니다. BMW와 무관하며 가격과 사양은 모두 가상의 값입니다. 드래그해서 돌려
        볼 수 있고, 3D 모델에는 외장 색상, 내장 색상(비슷한 색), 휠 크기, 휠 마감, 브레이크 캘리퍼
        색이 반영됩니다. 시트 구성과 가니쉬는 반영되지 않고 휠 모양은 한 가지입니다. 선루프는 선택
        품목({SUNROOF_LABELS})을 담았을 때만 보입니다.
      </span>
      <details>
        <summary className="focus-visible:ring-ring cursor-pointer rounded-sm underline underline-offset-2 focus-visible:ring-2 focus-visible:outline-none">
          3D 모델 출처와 고지
        </summary>
        <div className="mt-2 flex flex-col gap-1">
          <p>
            <a
              className="underline underline-offset-2"
              href={VEHICLE.credit.href}
              rel="noreferrer"
              target="_blank"
            >
              {VEHICLE.credit.work}
            </a>
            {' · '}
            {VEHICLE.credit.by}
            {' · '}
            <a
              className="underline underline-offset-2"
              href={VEHICLE.credit.licenseHref}
              rel="noreferrer"
              target="_blank"
            >
              {VEHICLE.credit.license}
            </a>
            {' · '}
            <a
              className="underline underline-offset-2"
              href={VEHICLE.credit.disclaimerHref}
              rel="noreferrer"
              target="_blank"
            >
              보증 부인
            </a>
          </p>
          <p>수정: {VEHICLE.credit.changes}</p>
          <p>{VEHICLE.credit.trademark}</p>
        </div>
      </details>
    </>
  );
}

/**
 * 좁은 화면에서는 차량 아래에 설명을 둘 자리가 없어 패널 맨 끝에 이 블록을 놓는다(`estimate-app.tsx`).
 * 넓은 화면에서는 `VehicleStage`의 `figcaption`이 같은 내용을 차량 아래에 보여 주고 이 블록은 숨긴다.
 */
export function StageNotes({ className }: { className?: string }) {
  return (
    <div className={className}>
      <StageNotesBody />
    </div>
  );
}

/**
 * 선택한 외장 색을 입힌 3D 차량. 모델에는 외장 색과 휠 크기만 반영되고 시트·내장은 반영되지 않는다.
 * 단계가 바뀌면 카메라가 그 단계의 시점(휠, 실내 등)으로 움직이고, 아래 버튼으로 다른 시점을 직접 고를 수도 있다.
 * 휠 확대는 캔버스가 페이지 스크롤을 가로채지 않도록 버튼으로 한다.
 */
export function VehicleStage({
  color,
  caliper,
  colorLabel,
  compact,
  interior,
  large,
  notice,
  onToggleLarge,
  rimFinish,
  sunroof,
  wheel,
  step,
}: {
  caliper: CaliperId;
  color: ColorId;
  colorLabel: string;
  /** 좁은 화면에서 패널을 내려 차량 영역을 줄인 상태. 좌우로 나누는 화면에서는 쓰지 않는다. */
  compact: boolean;
  interior: InteriorId;
  /** 좁은 화면에서 사용자가 차량 영역을 키운 상태 */
  large: boolean;
  /** 차량 위 아래쪽에 겹쳐 보이는 안내(자동으로 바뀐 선택 등). 배치를 바꾸지 않는다. */
  notice?: ReactNode;
  onToggleLarge: () => void;
  rimFinish: RimFinishId;
  /** 선루프 품목을 담았는지. 아니면 선루프 구멍을 막은 차를 보여 준다. */
  sunroof: boolean;
  wheel: WheelId;
  step: StepId;
}) {
  const inspectRef = useRef<InspectHandle | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  // 직접 고른 시점은 고른 단계에 머무는 동안만 유지한다. 단계가 바뀌면 그 단계의 시점을 따른다.
  const [picked, setPicked] = useState<{ step: StepId; view: CameraViewId } | null>(null);
  // 다른 단계로 가면 지운다. 지우지 않으면 그 단계로 돌아왔을 때 예전에 고른 시점이 되살아난다.
  if (picked && picked.step !== step) {
    setPicked(null);
  }
  const view = picked?.step === step ? picked.view : stageViewOf(step);
  // 선루프를 연 상태. 선루프 품목을 빼면 닫힌 상태로 돌려 놓는다(다시 담았을 때 열린 채로 나타나지 않게).
  const [sunroofOpen, setSunroofOpen] = useState(false);
  const sunRef = useRef<SunIconHandle>(null);
  // 열고 닫을 때마다 해 아이콘이 한 번 움직인다(처음 그릴 때는 가만히 있다).
  const sunroofOpenBefore = useRef(false);
  useEffect(() => {
    if (sunroofOpenBefore.current !== sunroofOpen) sunRef.current?.startAnimation();
    sunroofOpenBefore.current = sunroofOpen;
  }, [sunroofOpen]);
  if (!sunroof && sunroofOpen) {
    setSunroofOpen(false);
  }
  const inside = isInsideView(view);
  const paint = paintSwatchOf(color);
  const showFallback = unavailable || failed;
  const fallback = <StageFallback hex={paint.hex} label={colorLabel} />;

  return (
    <figure className="split:min-h-0 split:flex-1 split:gap-2 m-0 flex flex-col">
      <div
        className={cn(
          'border-border bg-card split:h-auto split:min-h-0 split:flex-1 split:rounded-lg split:border relative w-full overflow-hidden',
          // 좁은 화면의 높이: 기본, 패널을 내렸을 때, 사용자가 키웠을 때. 좌우로 나누는 화면에서는 남는 높이를 모두 쓴다.
          large ? 'h-[42dvh] min-h-56' : compact ? 'h-[18dvh] min-h-32' : 'h-[34dvh] min-h-48',
        )}
      >
        {/* 시점이 바뀌어도 화면 낭독기가 알 수 있게 항상 그려 두고 글자만 바꾼다(그려지는 순간 채워진 알림은 읽히지 않는 일이 많다). */}
        <p className="sr-only" role="status">
          {showFallback ? '' : `시점: ${CAMERA_VIEWS[view].label}`}
        </p>
        {notice}
        {inside && !showFallback ? (
          // 무대 안에 겹쳐 둔다. 캡션 줄에 넣으면 나타날 때마다 무대 높이가 바뀐다.
          <p className="bg-background/80 text-foreground text-caption split:max-w-[calc(100%-1.5rem)] absolute top-3 left-3 z-10 max-w-[calc(100%-4.5rem)] rounded-md px-2.5 py-1.5 backdrop-blur-sm">
            {INSIDE_VIEW_NOTE}
          </p>
        ) : null}
        {showFallback ? (
          fallback
        ) : (
          <ViewerBoundary
            fallback={fallback}
            onError={() => {
              setFailed(true);
            }}
          >
            <VehicleViewer
              inspectRef={inspectRef}
              onReady={() => {
                setReady(true);
              }}
              onUnavailable={() => {
                setUnavailable(true);
              }}
              caliper={caliperSwatchOf(caliper)}
              interior={interiorSwatchOf(interior)}
              rimFinish={rimFinishSwatchOf(rimFinish)}
              paint={paint}
              sunroof={sunroof}
              sunroofOpen={sunroofOpen}
              view={view}
              wheelInch={WHEEL_INCH[wheel]}
            />
            {/* 모델 부품을 불러오는 동안 빈 캔버스 대신 보인다. */}
            {!ready ? <StageLoading /> : null}
          </ViewerBoundary>
        )}
        {/* 좁은 화면에서만. 패널을 내려 줄어든 차량 영역을 직접 키우거나 되돌린다. 키우면 패널을 내려도 줄어들지 않는다. */}
        {!showFallback ? (
          <Button
            aria-label={large ? '차량 영역 줄이기' : '차량 영역 키우기'}
            aria-pressed={large}
            className="split:hidden absolute top-2 right-2 z-10"
            icon
            size="small"
            variant="secondary"
            onClick={onToggleLarge}
          >
            {large ? <MinimizeIcon /> : <MaximizeIcon />}
          </Button>
        ) : null}
      </div>
      {!showFallback ? (
        <div className="split:p-0 flex scrollbar-none items-center gap-2 overflow-x-auto px-4 py-2 lg:flex-wrap lg:justify-between lg:overflow-visible">
          <div className="flex shrink-0 gap-2 lg:flex-wrap">
            <div
              aria-label={CAMERA_CONTROL_LABELS.viewGroup}
              className="flex gap-2 lg:flex-wrap"
              role="group"
            >
              {STAGE_VIEW_OPTIONS.map((option) => (
                <Button
                  key={option.id}
                  aria-pressed={view === option.id}
                  disabled={!ready}
                  size="small"
                  variant="secondary"
                  onClick={() => {
                    setPicked({ step, view: option.id });
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            {sunroof ? (
              <Button
                aria-pressed={sunroofOpen}
                disabled={!ready}
                size="small"
                variant="secondary"
                onClick={() => {
                  setSunroofOpen((open) => !open);
                }}
              >
                <SunIcon ref={sunRef} data-icon="inline-start" />
                {CAMERA_CONTROL_LABELS.sunroofOpen}
              </Button>
            ) : null}
          </div>
          <div className="flex shrink-0 gap-2 lg:flex-wrap">
            {/* 회전과 확대는 좁은 화면(터치)에서 끌기와 두 손가락 벌리기로 하므로 숨기고, 처음 시점으로 돌리는 버튼만 둔다. */}
            <div
              aria-label={CAMERA_CONTROL_LABELS.rotateGroup}
              className="hidden gap-2 lg:flex lg:flex-wrap"
              role="group"
            >
              {(
                [
                  [ArrowLeftIcon, CAMERA_CONTROL_LABELS.rotateLeft, -1, 0],
                  [ArrowRightIcon, CAMERA_CONTROL_LABELS.rotateRight, 1, 0],
                  [ArrowUpIcon, CAMERA_CONTROL_LABELS.rotateUp, 0, -1],
                  [ArrowDownIcon, CAMERA_CONTROL_LABELS.rotateDown, 0, 1],
                ] as const
              ).map(([Glyph, label, azimuth, polar]) => (
                <Button
                  key={label}
                  aria-label={label}
                  disabled={!ready}
                  icon
                  size="small"
                  variant="secondary"
                  onClick={() => inspectRef.current?.rotateBy(azimuth, polar)}
                >
                  <Glyph />
                </Button>
              ))}
            </div>
            <Button
              aria-label={`차량 ${CAMERA_CONTROL_LABELS.zoomIn}`}
              className="hidden lg:inline-flex"
              disabled={!ready || inside}
              size="small"
              variant="secondary"
              onClick={() => inspectRef.current?.zoomIn()}
            >
              <MaximizeIcon data-icon="inline-start" />
              {CAMERA_CONTROL_LABELS.zoomIn}
            </Button>
            <Button
              aria-label={`차량 ${CAMERA_CONTROL_LABELS.zoomOut}`}
              className="hidden lg:inline-flex"
              disabled={!ready || inside}
              size="small"
              variant="secondary"
              onClick={() => inspectRef.current?.zoomOut()}
            >
              <MinimizeIcon data-icon="inline-start" />
              {CAMERA_CONTROL_LABELS.zoomOut}
            </Button>
            <Button
              disabled={!ready}
              size="small"
              variant="secondary"
              onClick={() => inspectRef.current?.reset()}
            >
              <RotateCCWIcon data-icon="inline-start" />
              {CAMERA_CONTROL_LABELS.reset}
            </Button>
          </div>
        </div>
      ) : null}
      <figcaption className="text-muted-foreground text-caption hidden flex-col gap-1 lg:flex">
        <StageNotesBody />
      </figcaption>
    </figure>
  );
}
