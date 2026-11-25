'use client';

import { vehicleById, vehicleUrls } from '@repo/vehicle-3d/vehicles';
import { type InspectHandle, useModelAvailable, VehicleCanvas } from '@repo/vehicle-3d/viewer';
import type { CameraViewId } from '@repo/vehicle-3d/views';
import { useEffect, useRef } from 'react';

import {
  caliperSwatchOf,
  hasSunroof,
  interiorSwatchOf,
  paintSwatchOf,
  rimFinishSwatchOf,
  type Selection,
  WHEEL_INCH,
} from '../../estimate/index.model';

const VEHICLE = vehicleById('x5-web');

/**
 * 인트로의 3D 차량. three를 끌어오는 모듈이라 `intro-stage.tsx`가 `next/dynamic`(ssr: false)으로만 불러온다.
 * 견적 화면과 같은 모델과 같은 선택→도장·휠 매핑을 쓰므로, 인트로에서 본 차는 견적 화면의 차와 같다.
 */
export default function IntroViewer({
  selection,
  view,
  onUnavailable,
  onReady,
}: {
  selection: Selection;
  view: CameraViewId;
  onUnavailable: () => void;
  onReady: () => void;
}) {
  const available = useModelAvailable(vehicleUrls(VEHICLE)[0] ?? '');
  // `VehicleCanvas`는 이 ref가 있어야 카메라 컨트롤(드래그 회전, 시점 이동)을 붙인다. 없으면 `view`는 첫 위치로만 쓰이고 그 뒤로는 움직이지 않는다.
  const inspectRef = useRef<InspectHandle | null>(null);

  useEffect(() => {
    if (available === false) onUnavailable();
  }, [available, onUnavailable]);

  if (available === false) return null;

  return (
    <VehicleCanvas
      available={available}
      className="size-full"
      inspectRef={inspectRef}
      caliper={caliperSwatchOf(selection.caliper)}
      interior={interiorSwatchOf(selection.interior)}
      onReady={onReady}
      paint={paintSwatchOf(selection.color)}
      rimFinish={rimFinishSwatchOf(selection.rimFinish)}
      sunroof={hasSunroof(selection.packages)}
      vehicleId="x5-web"
      view={view}
      wheelInch={WHEEL_INCH[selection.wheel]}
      // 인트로는 페이지가 스크롤된다. 휠 확대를 끄면 마우스 휠은 페이지를 스크롤하고, 세로 터치 드래그도 페이지로 넘어간다
      // (가로로 끌 때만 차가 돈다). 확대는 인트로에 필요하지 않다.
      wheelZoom={false}
    />
  );
}
