'use client';

import { caliperById, type CaliperId } from '@repo/vehicle-3d/calipers';
import { interiorById, type InteriorId } from '@repo/vehicle-3d/interiors';
import { paintById, type PaintId } from '@repo/vehicle-3d/paints';
import { rimFinishById, type RimFinishId } from '@repo/vehicle-3d/rim-finishes';
import {
  vehicleById,
  type VehicleId,
  vehicleMissingHint,
  vehicleUrls,
} from '@repo/vehicle-3d/vehicles';
import { type InspectHandle, useModelAvailable, VehicleCanvas } from '@repo/vehicle-3d/viewer';
import { CAMERA_VIEWS, type CameraViewId, DEFAULT_CAMERA_VIEW } from '@repo/vehicle-3d/views';
import { useRef, useState } from 'react';

import { InspectStage } from './inspect-stage';
import { SequenceOverlay, VehicleCredit } from './overlay';

/**
 * Storybook 데모. 3D 엔진(캔버스, 모델 조립, 도장, 조명)은 `@repo/vehicle-3d` 에 있고, 여기에는
 * 이 스토리의 크롬만 있다: 도장 칩과 줌 버튼 오버레이(`Button`), 크레딧 표기. 스크롤은 쓰지 않는다.
 */
/** 장면을 PNG로 만들어 내려받는다. 차량이 아직 그려지지 않았으면 아무 일도 하지 않는다. */
async function saveImage(handle: InspectHandle | null, name: string) {
  const blob = await handle?.capture();
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 10_000);
}

export function ThreeGltfDemo({
  vehicleId = 'x5',
  initialView = DEFAULT_CAMERA_VIEW,
}: {
  vehicleId?: VehicleId;
  /** 처음 보이는 카메라 시점 */
  initialView?: CameraViewId;
} = {}) {
  const vehicle = vehicleById(vehicleId);
  const urls = vehicleUrls(vehicle);
  const available = useModelAvailable(urls[0] ?? '');
  // null 이면 모델 원래 색
  const [paintId, setPaintId] = useState<PaintId | null>(null);
  const [sunroof, setSunroof] = useState(true);
  const [sunroofOpen, setSunroofOpen] = useState(false);
  const [caliperId, setCaliperId] = useState<CaliperId>('standard');
  const [rimFinishId, setRimFinishId] = useState<RimFinishId>('standard');
  const [interiorId, setInteriorId] = useState<InteriorId>('black');
  const [view, setView] = useState<CameraViewId>(initialView);
  const inspectRef = useRef<InspectHandle | null>(null);
  const inside = CAMERA_VIEWS[view].inside;

  return (
    <InspectStage
      alt={`${vehicle.kind} 모델입니다. 드래그하면 회전하고 스크롤하면 확대됩니다.`}
      credit={<VehicleCredit vehicleId={vehicleId} />}
      hint={inside ? '드래그로 둘러보기' : undefined}
      overlay={
        <SequenceOverlay
          engine="Three.js"
          kind={vehicle.kind}
          paintId={paintId}
          caliperId={caliperId}
          onCaliperId={setCaliperId}
          rimFinishId={rimFinishId}
          onRimFinishId={setRimFinishId}
          interiorId={interiorId}
          onInteriorId={setInteriorId}
          sunroof={sunroof}
          onSunroof={setSunroof}
          sunroofOpen={sunroofOpen}
          onSunroofOpen={setSunroofOpen}
          view={view}
          onView={setView}
          onPaintId={setPaintId}
          onResetView={() => inspectRef.current?.reset()}
          onSaveImage={() => {
            void saveImage(inspectRef.current, `${vehicle.label}.png`);
          }}
          onRotateBy={(azimuth, polar) => inspectRef.current?.rotateBy(azimuth, polar)}
          onZoomIn={() => inspectRef.current?.zoomIn()}
          onZoomOut={() => inspectRef.current?.zoomOut()}
        />
      }
    >
      {available === false ? (
        <p className="text-muted-foreground text-caption absolute inset-x-0 top-8 px-6">
          {vehicleMissingHint(vehicle) ?? (
            <>
              {vehicle.label} 모델이 없습니다. <code>pnpm --filter @repo/ui copy:car</code>
            </>
          )}
        </p>
      ) : null}
      <VehicleCanvas
        available={available}
        className="absolute inset-0 size-full touch-none"
        inspectRef={inspectRef}
        caliper={caliperById(caliperId)}
        interior={interiorById(interiorId)}
        rimFinish={rimFinishById(rimFinishId)}
        paint={paintId ? paintById(paintId) : undefined}
        sunroof={sunroof}
        sunroofOpen={sunroofOpen}
        vehicleId={vehicleId}
        view={view}
      />
    </InspectStage>
  );
}
