'use client';

import { usePaintSelection } from '@repo/vehicle-3d/paints';
import {
  vehicleById,
  type VehicleId,
  vehicleMissingHint,
  vehicleUrls,
} from '@repo/vehicle-3d/vehicles';
import { type InspectHandle, useModelAvailable, VehicleCanvas } from '@repo/vehicle-3d/viewer';
import { useRef } from 'react';

import { InspectStage } from './inspect-stage';
import { SequenceOverlay, VehicleCredit } from './overlay';
import { ScrollPinStage } from './pin-stage';

/**
 * Storybook 데모. 3D 엔진(캔버스, 모델 조립, 도장, 조명)은 `@repo/vehicle-3d` 에 있고, 여기에는
 * 이 스토리의 크롬만 있다: 스크롤 핀(GSAP), 도장 칩 오버레이(`Button`), 크레딧 표기.
 */
export function ThreeGltfDemo({
  vehicleId = 'x5',
  oem = false,
}: {
  vehicleId?: VehicleId;
  oem?: boolean;
} = {}) {
  const progressRef = useRef(0);
  const vehicle = vehicleById(vehicleId);
  const urls = vehicleUrls(vehicle);
  const available = useModelAvailable(urls[0] ?? '');
  const { paintId, setPaintId, paint } = usePaintSelection();
  const inspectRef = useRef<InspectHandle | null>(null);

  const overlay = (
    <SequenceOverlay
      engine="Three.js"
      kind={vehicle.kind}
      oem={oem}
      paintId={oem ? undefined : paintId}
      onPaintId={oem ? undefined : setPaintId}
      onResetView={
        oem
          ? () => {
              inspectRef.current?.reset();
            }
          : undefined
      }
      onZoomIn={
        oem
          ? () => {
              inspectRef.current?.zoomIn();
            }
          : undefined
      }
      onZoomOut={
        oem
          ? () => {
              inspectRef.current?.zoomOut();
            }
          : undefined
      }
    />
  );

  const canvas = (
    <VehicleCanvas
      available={available}
      className="absolute inset-0 size-full touch-none"
      inspectRef={inspectRef}
      mode={oem ? 'inspect' : 'paint'}
      paint={paint}
      progressRef={progressRef}
      vehicleId={vehicleId}
    />
  );

  const missing =
    available === false ? (
      <p className="text-muted-foreground text-caption absolute inset-x-0 top-8 px-6">
        {vehicleMissingHint(vehicle) ?? (
          <>
            {vehicle.label} 모델이 없습니다. <code>pnpm --filter @repo/ui copy:car</code>
          </>
        )}
      </p>
    ) : null;

  if (oem) {
    return (
      <InspectStage
        alt={`${vehicle.kind} 원본 모델입니다. 드래그하면 회전하고 스크롤하면 확대됩니다.`}
        credit={<VehicleCredit vehicleId={vehicleId} />}
        overlay={overlay}
      >
        {missing}
        {canvas}
      </InspectStage>
    );
  }

  return (
    <ScrollPinStage
      alt={`${vehicle.kind} 모델이 스크롤에 따라 돌아갑니다.`}
      credit={<VehicleCredit vehicleId={vehicleId} />}
      overlay={overlay}
      onProgress={(progress) => {
        progressRef.current = progress;
      }}
    >
      {missing}
      {canvas}
    </ScrollPinStage>
  );
}
