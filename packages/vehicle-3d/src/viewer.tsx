'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { type RefObject, useEffect, useState } from 'react';
import { Box3, type Object3D, Vector3 } from 'three';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { alignVehicleHeading, type VehicleFront } from './align-vehicle';
import {
  applyThreePaint,
  enableThreeShadows,
  restoreThreePaint,
  threePaintFromSwatch,
} from './apply-three-paint';
import { assembleG05Three } from './assemble-g05-three';
import { GROUND_Y, STUDIO_CAMERA } from './constants';
import { InspectControls, type InspectHandle } from './inspect-controls';
import type { PaintSwatch } from './paints';
import { ThreeStudio } from './three-studio';
import { vehicleById, type VehicleId } from './vehicles';
import { applyWheelSize, NATIVE_WHEEL_INCH } from './wheel-size';

export { type InspectHandle } from './inspect-controls';
export { useModelAvailable } from './use-model-available';

function sitOnGround(root: Object3D, groundY: number) {
  const box = new Box3().setFromObject(root);
  root.position.y += groundY - box.min.y;
}

function fitObject(root: Object3D, size = 4.2) {
  root.updateWorldMatrix(true, true);
  const box = new Box3().setFromObject(root);
  const dim = new Vector3();
  box.getSize(dim);
  const longest = Math.max(dim.x, dim.y, dim.z) || 1;
  root.scale.multiplyScalar(size / longest);
  const fitted = new Box3().setFromObject(root);
  const center = new Vector3();
  fitted.getCenter(center);
  root.position.sub(center);
  sitOnGround(root, GROUND_Y);
}

/** 모델 파일은 호스트 앱이 `/models/<file>` 로 서빙한다 (이 패키지는 에셋을 싣지 않는다) */
function loadVehicleFile(file: string) {
  // 웹용 최적화 모델(.glb)은 EXT_meshopt_compression 으로 압축돼 있다. 디코더는 three 안에 들어 있다.
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  return loader.loadAsync(`/models/${file}`).then((gltf) => gltf.scene);
}

function hideUtilityMeshes(root: Object3D) {
  root.traverse((node) => {
    const name = node.name.toLowerCase();
    if (name.includes('blobshadow') || name.includes('shadow_')) {
      node.visible = false;
    }
  });
}

function GltfModel({
  files,
  paint,
  wheelInch,
  front,
  onReady,
}: {
  files: readonly string[];
  /** 없으면 모델 원래 색 */
  paint?: PaintSwatch;
  /** 휠 크기(인치). 없으면 모델 원래 크기(21인치). 바꿔도 모델을 다시 불러오지 않는다. */
  wheelInch?: number;
  front?: VehicleFront;
  /** 모든 부품을 불러와 조립을 마쳤을 때 한 번 호출한다. */
  onReady?: () => void;
}) {
  const [model, setModel] = useState<Object3D | null>(null);
  const invalidate = useThree((state) => state.invalidate);
  const fileKey = files.join('|');

  useEffect(() => {
    let cancelled = false;

    void Promise.all(files.map((file) => loadVehicleFile(file)))
      .then((gltfs) => {
        if (cancelled) {
          return;
        }
        const parts = files.flatMap((file, index) => {
          const scene = gltfs[index];
          return scene ? [{ file, scene }] : [];
        });
        const root = assembleG05Three(parts);
        hideUtilityMeshes(root);
        alignVehicleHeading(root, front);
        fitObject(root);
        enableThreeShadows(root);
        setModel(root);
        invalidate();
        onReady?.();
      })
      .catch(() => {
        if (!cancelled) {
          setModel(null);
        }
      });

    return () => {
      cancelled = true;
    };
    // 도장은 아래 효과에서 따로 적용해서, 색을 바꿔도 GLB 를 다시 불러오지 않는다.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per file set
  }, [fileKey, invalidate]);

  useEffect(() => {
    if (!model) {
      return;
    }
    if (paint) {
      applyThreePaint(model, threePaintFromSwatch(paint));
    } else {
      restoreThreePaint(model);
    }
    invalidate();
  }, [invalidate, model, paint]);

  useEffect(() => {
    if (!model) {
      return;
    }
    applyWheelSize(model, wheelInch ?? NATIVE_WHEEL_INCH);
    invalidate();
  }, [invalidate, model, wheelInch]);

  if (!model) {
    return null;
  }

  return <primitive object={model} />;
}

export type VehicleCanvasProps = {
  vehicleId?: VehicleId;
  /** 도장 색. 없으면 모델 원래 색입니다. 바꿔도 모델을 다시 불러오지 않습니다. */
  paint?: PaintSwatch;
  /** 줌 인·아웃과 리셋을 호스트가 제어할 때 넘깁니다. 드래그 회전과 휠 줌은 항상 켜져 있습니다. */
  inspectRef?: RefObject<InspectHandle | null>;
  /** false 이면 휠·핀치 확대를 끈다. 페이지가 스크롤될 때 휠이 캔버스에 걸리지 않는다. 확대는 `inspectRef`의 `zoomIn`·`zoomOut`으로 합니다. */
  wheelZoom?: boolean;
  /** 휠 크기(인치). 림 크기와 타이어 옆면 두께가 바뀐다. 없으면 모델 원래 크기(21인치). */
  wheelInch?: number;
  /** 모델 조립이 끝났을 때 한 번 호출된다. 호스트가 로딩 표시를 걷는 데 쓴다. */
  onReady?: () => void;
  /** `useModelAvailable` 의 결과. true 일 때만 모델을 불러온다 */
  available: boolean | null;
  /** 캔버스에 붙는 클래스 (레이아웃은 호스트가 정한다) */
  className?: string;
};

/**
 * 차량 3D 캔버스. 스튜디오 조명과 그림자, 모델 로딩·조립·정렬을 모두 포함한다. 드래그로 돌리고 휠로 확대한다.
 * 호스트(Storybook, 앱)가 크기와 오버레이를 정한다. Motion 을 이 캔버스에 쓰지 않는다.
 */
export function VehicleCanvas({
  vehicleId = 'x5',
  paint,
  inspectRef,
  wheelZoom,
  wheelInch,
  onReady,
  available,
  className,
}: VehicleCanvasProps) {
  const vehicle = vehicleById(vehicleId);

  return (
    <Canvas
      aria-hidden
      className={className}
      camera={{ position: [...STUDIO_CAMERA.position], fov: STUDIO_CAMERA.fov }}
      gl={{ alpha: true, antialias: true }}
      shadows
    >
      <ThreeStudio />
      {inspectRef ? <InspectControls handleRef={inspectRef} wheelZoom={wheelZoom} /> : null}
      {available ? (
        <GltfModel
          key={vehicle.id}
          files={vehicle.files}
          front={vehicle.front}
          onReady={onReady}
          paint={paint}
          wheelInch={wheelInch}
        />
      ) : null}
    </Canvas>
  );
}
