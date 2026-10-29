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
import { Morph } from '@repo/ui/morph';
import { Segmented, SegmentedItem } from '@repo/ui/segmented';
import { Skeleton, SkeletonGroup } from '@repo/ui/skeleton';
import { SwitchField } from '@repo/ui/switch-field';
import { vehicleById } from '@repo/vehicle-3d/vehicles';
import type { InspectHandle } from '@repo/vehicle-3d/viewer';
import {
  CAMERA_CONTROL_LABELS,
  CAMERA_VIEWS,
  type CameraViewId,
  INSIDE_VIEW_NOTE,
  INSIDE_VIEW_NOTE_APPROX,
  INSIDE_VIEW_NOTE_NO_ZOOM,
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
import type { CaliperId, ColorId, Effect, InteriorId, RimFinishId, WheelId } from '../model/types';
import { WHEEL_INCH } from '../model/wheel-map';
import { NOTICE_LEAD, useStageNotice } from './stage-notice';

const VEHICLE = vehicleById('x5-web');

/** 선루프 스위치의 이름. 상태에 따라 바꾸지 않는다(상태는 스위치와 옆의 글자가 알린다). */
const SUNROOF_SWITCH_LABEL = '선루프 열어 보기';

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
  notices,
  onCaptureChange,
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
  /** 자동으로 바뀐 선택. 왼쪽 위 틀에 잠깐 문장으로 보인다(차량 위에 겹쳐 배치를 바꾸지 않는다). */
  notices: readonly Effect[];
  /**
   * 차량 이미지를 만들 수 있는지 알린다. 모델이 다 그려지면 이미지를 만드는 함수를, 아직이거나 3D를 쓸 수 없으면 null을 넘긴다.
   * 이미지는 화면의 시점과 상관없이 늘 같은 앞 3/4 구도다.
   */
  onCaptureChange?: (capture: (() => Promise<Blob | null>) | null) => void;
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
  if (!sunroof && sunroofOpen) {
    setSunroofOpen(false);
  }
  const inside = isInsideView(view);
  const stageNotice = useStageNotice(notices);
  const paint = paintSwatchOf(color);
  const showFallback = unavailable || failed;
  const canCapture = ready && !showFallback;
  useEffect(() => {
    onCaptureChange?.(
      canCapture ? () => inspectRef.current?.capture() ?? Promise.resolve(null) : null,
    );
    return () => {
      onCaptureChange?.(null);
    };
  }, [canCapture, onCaptureChange]);
  const fallback = <StageFallback hex={paint.hex} label={colorLabel} />;

  return (
    <figure className="split:min-h-0 split:flex-1 split:gap-2 m-0 flex flex-col">
      <div
        className={cn(
          'border-border bg-card split:h-auto split:min-h-0 split:flex-1 split:rounded-lg split:border relative w-full overflow-hidden',
          // 좁은 화면의 높이: 기본, 패널을 내렸을 때. 좌우로 나누는 화면에서는 남는 높이를 모두 쓴다.
          compact ? 'h-[18dvh] min-h-32' : 'h-[34dvh] min-h-48',
        )}
      >
        {/* 시점이 바뀌어도 화면 낭독기가 알 수 있게 항상 그려 두고 글자만 바꾼다(그려지는 순간 채워진 알림은 읽히지 않는 일이 많다). */}
        <p className="sr-only" role="status">
          {showFallback
            ? ''
            : `시점: ${CAMERA_VIEWS[view].label}${inside ? `. ${INSIDE_VIEW_NOTE}` : ''}`}
        </p>
        {/* 자동 변경 알림은 틀이 잠깐만 보여 주므로, 낭독기에는 항상 있는 이 영역에 같은 문장을 넣는다. */}
        <p className="sr-only" role="status">
          {showFallback || !stageNotice.visible ? '' : stageNotice.message}
        </p>
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
        {!showFallback ? (
          <>
            {/* 왼쪽 위 모서리는 한 틀이 번갈아 쓴다: 선루프 품목이 있으면 스위치 알약, 안쪽 시점이면 안내 문구, 선택이 자동으로 바뀌면 그 문장(잠깐). 내용이 바뀌면 틀이 새 내용의 크기로 변형된다. 틀은 차량 위에 겹쳐서 자리를 잡지 않고, 오른쪽 위 도구 판(폭 42px)을 가리지 않게 오른쪽을 비운다. */}
            <div className="absolute top-3 left-3 z-10 max-w-[calc(100%-4.5rem)]">
              <Morph
                // 틀 안의 "열림/닫힘" 글자는 옅은 글자색이라, 어두운 차 위에서도 4.5:1을 지키도록 판보다 불투명하게 둔다(95%).
                className="bg-background/95 border-border max-w-full border backdrop-blur-sm"
                order={['switch', 'note', 'notice']}
                radii={{ switch: 18, note: 8, notice: 8 }}
                value={stageNotice.visible ? 'notice' : inside ? 'note' : sunroof ? 'switch' : null}
              >
                {stageNotice.visible ? (
                  <p className="text-foreground text-caption px-2.5 py-1.5">
                    <span className="font-semibold">{NOTICE_LEAD}</span> {stageNotice.detail}
                  </p>
                ) : inside ? (
                  <p className="text-foreground text-caption px-2.5 py-1.5">
                    {INSIDE_VIEW_NOTE_APPROX}
                    {/* 확대가 꺼진 이유는 비활성 버튼이 이미 보여 준다. 좁은 화면에서는 안내가 차량을 덮지 않게 앞 문장만 두고, 낭독기에는 전체를 읽어 준다. */}
                    <span className="hidden xl:inline"> {INSIDE_VIEW_NOTE_NO_ZOOM}</span>
                  </p>
                ) : (
                  // 스위치 포커스 링(4px)이 틀 가장자리에서 잘리지 않게 왼쪽과 위아래에 여유를 둔다.
                  <div className="flex py-1 pr-3 pl-1">
                    <SwitchField
                      checked={sunroofOpen}
                      disabled={!ready}
                      label={SUNROOF_SWITCH_LABEL}
                      status={{ on: '열림', off: '닫힘' }}
                      onChange={(event) => {
                        setSunroofOpen(event.target.checked);
                      }}
                    />
                  </div>
                )}
              </Morph>
            </div>
            {/* 패널을 내려 차량 영역이 줄었을 때는 비운다(그 높이에는 들어가지 않는다). */}
            {!compact ? (
              <>
                {/* 버튼 배경이 투명이라 차량 색과 겹치면 안 보인다(확대하면 차체가 화면을 채운다). 선루프 알약과 같은 반투명 판 위에 올린다. */}
                <div className="bg-background/85 border-border absolute top-3 right-3 z-10 flex flex-col gap-1 rounded-lg border p-1 backdrop-blur-sm">
                  <Button
                    aria-label={`차량 ${CAMERA_CONTROL_LABELS.zoomIn}`}
                    disabled={!ready || inside}
                    icon
                    size="small"
                    variant="clear"
                    onClick={() => inspectRef.current?.zoomIn()}
                  >
                    <MaximizeIcon />
                  </Button>
                  <Button
                    aria-label={`차량 ${CAMERA_CONTROL_LABELS.zoomOut}`}
                    disabled={!ready || inside}
                    icon
                    size="small"
                    variant="clear"
                    onClick={() => inspectRef.current?.zoomOut()}
                  >
                    <MinimizeIcon />
                  </Button>
                  <Button
                    aria-label={CAMERA_CONTROL_LABELS.reset}
                    disabled={!ready}
                    icon
                    size="small"
                    variant="clear"
                    onClick={() => inspectRef.current?.reset()}
                  >
                    <RotateCCWIcon />
                  </Button>
                </div>
                {/* 끌기와 두 손가락 벌리기만으로는 손가락 하나로 할 수 없는 사람이 쓸 수 없으므로, 좁은 화면에서도 버튼을 둔다. */}
                <div
                  aria-label={CAMERA_CONTROL_LABELS.rotateGroup}
                  className="bg-background/85 border-border short-touch:hidden absolute right-3 bottom-3 z-10 flex gap-1 rounded-lg border p-1 backdrop-blur-sm"
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
                      variant="clear"
                      onClick={() => inspectRef.current?.rotateBy(azimuth, polar)}
                    >
                      <Glyph />
                    </Button>
                  ))}
                </div>
              </>
            ) : null}
          </>
        ) : null}
      </div>
      {!showFallback ? (
        // 시점만 한 줄로 둔다. 확대·축소·회전은 차량 위에 겹치고, 선루프 스위치도 차량 위에 겹친다(자리를 잡지 않는다).
        <div className="split:p-0 px-4 py-2">
          <Segmented
            aria-label={CAMERA_CONTROL_LABELS.viewGroup}
            className="w-full lg:w-fit"
            value={view}
            onValueChange={(next) => {
              const option = STAGE_VIEW_OPTIONS.find((item) => item.id === next);
              if (option) setPicked({ step, view: option.id });
            }}
          >
            {STAGE_VIEW_OPTIONS.map((option) => (
              <SegmentedItem
                key={option.id}
                className="flex-1 lg:flex-none"
                disabled={!ready}
                value={option.id}
              >
                {option.label}
              </SegmentedItem>
            ))}
          </Segmented>
        </div>
      ) : null}
      <figcaption className="text-muted-foreground text-caption hidden flex-col gap-1 lg:flex">
        <StageNotesBody />
      </figcaption>
    </figure>
  );
}
