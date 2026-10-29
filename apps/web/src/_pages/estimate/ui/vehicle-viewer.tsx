'use client';

import type { CaliperSwatch } from '@repo/vehicle-3d/calipers';
import type { InteriorSwatch } from '@repo/vehicle-3d/interiors';
import type { PaintSwatch } from '@repo/vehicle-3d/paints';
import type { RimFinishSwatch } from '@repo/vehicle-3d/rim-finishes';
import { vehicleById, vehicleUrls } from '@repo/vehicle-3d/vehicles';
import { type InspectHandle, useModelAvailable, VehicleCanvas } from '@repo/vehicle-3d/viewer';
import type { CameraViewId } from '@repo/vehicle-3d/views';
import { type RefObject, useEffect } from 'react';

const VEHICLE = vehicleById('x5-web');

/**
 * three를 끌어오는 모듈이라 `vehicle-stage.tsx`가 `next/dynamic`(ssr: false)으로만 불러온다.
 * 모델 파일이 없으면(`useModelAvailable`) 캔버스를 그리지 않고 `onUnavailable`로 알린다.
 */
export default function VehicleViewer({
  paint,
  interior,
  caliper,
  rimFinish,
  sunroof,
  sunroofOpen,
  wheelInch,
  inspectRef,
  view,
  onUnavailable,
  onReady,
}: {
  paint: PaintSwatch;
  interior: InteriorSwatch;
  caliper: CaliperSwatch;
  rimFinish: RimFinishSwatch;
  sunroof: boolean;
  sunroofOpen: boolean;
  wheelInch: number;
  view: CameraViewId;
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
      caliper={caliper}
      rimFinish={rimFinish}
      interior={interior}
      onReady={onReady}
      paint={paint}
      sunroof={sunroof}
      sunroofOpen={sunroofOpen}
      vehicleId="x5-web"
      view={view}
      wheelInch={wheelInch}
      wheelZoom={false}
      // 차량 영역은 스크롤되는 패널 밖에 있고 페이지도 스크롤되지 않으므로(작은 창 `tiny` 제외) 내줄 스크롤이 없다. 세로 드래그도 회전에 쓴다.
      touchScroll={false}
    />
  );
}
