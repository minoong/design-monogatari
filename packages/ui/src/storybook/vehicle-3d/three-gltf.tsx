'use client';

import { paintById, type PaintId } from '@repo/vehicle-3d/paints';
import {
  vehicleById,
  type VehicleId,
  vehicleMissingHint,
  vehicleUrls,
} from '@repo/vehicle-3d/vehicles';
import { type InspectHandle, useModelAvailable, VehicleCanvas } from '@repo/vehicle-3d/viewer';
import { useRef, useState } from 'react';

import { InspectStage } from './inspect-stage';
import { SequenceOverlay, VehicleCredit } from './overlay';

/**
 * Storybook 데모. 3D 엔진(캔버스, 모델 조립, 도장, 조명)은 `@repo/vehicle-3d` 에 있고, 여기에는
 * 이 스토리의 크롬만 있다: 도장 칩과 줌 버튼 오버레이(`Button`), 크레딧 표기. 스크롤은 쓰지 않는다.
 */
export function ThreeGltfDemo({ vehicleId = 'x5' }: { vehicleId?: VehicleId } = {}) {
  const vehicle = vehicleById(vehicleId);
  const urls = vehicleUrls(vehicle);
  const available = useModelAvailable(urls[0] ?? '');
  // null 이면 모델 원래 색
  const [paintId, setPaintId] = useState<PaintId | null>(null);
  const inspectRef = useRef<InspectHandle | null>(null);

  return (
    <InspectStage
      alt={`${vehicle.kind} 모델입니다. 드래그하면 회전하고 스크롤하면 확대됩니다.`}
      credit={<VehicleCredit vehicleId={vehicleId} />}
      overlay={
        <SequenceOverlay
          engine="Three.js"
          kind={vehicle.kind}
          paintId={paintId}
          onPaintId={setPaintId}
          onResetView={() => inspectRef.current?.reset()}
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
        paint={paintId ? paintById(paintId) : undefined}
        vehicleId={vehicleId}
      />
    </InspectStage>
  );
}
