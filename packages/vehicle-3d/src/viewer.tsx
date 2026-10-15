'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { type RefObject, useEffect, useState } from 'react';
import { Box3, type Object3D, Vector3 } from 'three';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { alignVehicleHeading, type VehicleFront } from './align-vehicle';
import { applyThreePaint, enableThreeShadows, threePaintFromSwatch } from './apply-three-paint';
import { assembleG05Three } from './assemble-g05-three';
import { GROUND_Y, STUDIO_CAMERA } from './constants';
import { InspectControls, type InspectHandle } from './inspect-controls';
import type { PaintSwatch } from './paints';
import { ThreeStudio } from './three-studio';
import { ThreeYawGroup } from './three-yaw';
import { vehicleById, type VehicleId } from './vehicles';

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
  front,
  oem = false,
}: {
  files: readonly string[];
  paint?: PaintSwatch;
  front?: VehicleFront;
  oem?: boolean;
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
        if (!oem && paint) {
          applyThreePaint(root, threePaintFromSwatch(paint));
        }
        setModel(root);
        invalidate();
      })
      .catch(() => {
        if (!cancelled) {
          setModel(null);
        }
      });

    return () => {
      cancelled = true;
    };
    // Paint is applied in a later effect so a color change does not reload the GLB.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per file set
  }, [fileKey, invalidate, oem]);

  useEffect(() => {
    if (!model || oem || !paint) {
      return;
    }
    applyThreePaint(model, threePaintFromSwatch(paint));
    invalidate();
  }, [invalidate, model, oem, paint]);

  if (!model) {
    return null;
  }

  return <primitive object={model} />;
}

export type VehicleCanvasProps = {
  vehicleId?: VehicleId;
  /**
   * `paint`: 도장 색을 `paint` 로 교체하고 모델을 `progressRef`(0~1)에 맞춰 돌린다.
   * `inspect`: 원본 머티리얼 + OrbitControls (`inspectRef` 로 reset/zoom 제어).
   */
  mode: 'paint' | 'inspect';
  paint?: PaintSwatch;
  progressRef?: RefObject<number>;
  inspectRef?: RefObject<InspectHandle | null>;
  /** `useModelAvailable` 의 결과. true 일 때만 모델을 불러온다 */
  available: boolean | null;
  /** 캔버스에 붙는 클래스 (레이아웃은 호스트가 정한다) */
  className?: string;
};

/**
 * 차량 3D 캔버스. 스튜디오 조명과 그림자, 모델 로딩·조립·정렬을 모두 포함한다.
 * 호스트(Storybook, 앱)가 크기와 오버레이를 정한다. Motion 을 이 캔버스에 쓰지 않는다.
 */
export function VehicleCanvas({
  vehicleId = 'x5',
  mode,
  paint,
  progressRef,
  inspectRef,
  available,
  className,
}: VehicleCanvasProps) {
  const vehicle = vehicleById(vehicleId);
  const oem = mode === 'inspect';

  return (
    <Canvas
      aria-hidden
      className={className}
      camera={{ position: [...STUDIO_CAMERA.position], fov: STUDIO_CAMERA.fov }}
      gl={{ alpha: true, antialias: true }}
      shadows
    >
      <ThreeStudio />
      {oem && inspectRef ? <InspectControls handleRef={inspectRef} /> : null}
      {oem ? (
        available ? (
          <GltfModel key={`${vehicle.id}:oem`} files={vehicle.files} front={vehicle.front} oem />
        ) : null
      ) : progressRef ? (
        <ThreeYawGroup progressRef={progressRef}>
          {available ? (
            <GltfModel
              key={`${vehicle.id}:paint`}
              files={vehicle.files}
              front={vehicle.front}
              paint={paint}
            />
          ) : null}
        </ThreeYawGroup>
      ) : null}
    </Canvas>
  );
}
