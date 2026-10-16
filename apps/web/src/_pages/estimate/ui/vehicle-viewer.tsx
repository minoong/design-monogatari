'use client';

import type { PaintSwatch } from '@repo/vehicle-3d/paints';
import { vehicleById, vehicleUrls } from '@repo/vehicle-3d/vehicles';
import { type InspectHandle, useModelAvailable, VehicleCanvas } from '@repo/vehicle-3d/viewer';
import { type RefObject, useEffect } from 'react';

const VEHICLE = vehicleById('x5-web');

/**
 * three를 끌어오는 모듈이라 `vehicle-stage.tsx`가 `next/dynamic`(ssr: false)으로만 불러온다.
 * 모델 파일이 없으면(`useModelAvailable`) 캔버스를 그리지 않고 `onUnavailable`로 알린다.
 */
export default function VehicleViewer({
  paint,
  wheelInch,
  inspectRef,
  onUnavailable,
  onReady,
}: {
  paint: PaintSwatch;
  wheelInch: number;
  inspectRef: RefObject<InspectHandle | null>;
  onUnavailable: () => void;
  onReady: () => void;
}) {
  const available = useModelAvailable(vehicleUrls(VEHICLE)[0] ?? '');

  useEffect(() => {
    if (available === false) onUnavailable();
  }, [available, onUnavailable]);

  if (available === false) return null;

  return (
    <VehicleCanvas
      available={available}
      className="size-full"
      inspectRef={inspectRef}
      onReady={onReady}
      paint={paint}
      vehicleId="x5-web"
      wheelInch={wheelInch}
      wheelZoom={false}
    />
  );
}
