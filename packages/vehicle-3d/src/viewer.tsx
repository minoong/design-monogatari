'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { Box3, type Object3D, PCFShadowMap, Vector3 } from 'three';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { alignVehicleHeading, type VehicleFront } from './align-vehicle';
import { applyThreeCaliper } from './apply-three-caliper';
import { applyThreeInterior } from './apply-three-interior';
import {
  applyThreePaint,
  enableThreeShadows,
  restoreThreePaint,
  threePaintFromSwatch,
} from './apply-three-paint';
import { applyThreeRim } from './apply-three-rim';
import { assembleG05Three } from './assemble-g05-three';
import { CALIPER_SWATCHES, type CaliperSwatch } from './calipers';
import { CAMERA_VIEWS, type CameraViewId, DEFAULT_CAMERA_VIEW } from './camera-views';
import { GROUND_Y, VEHICLE_MODEL_NAME } from './constants';
import { InspectControls, type InspectHandle } from './inspect-controls';
import { INTERIOR_SWATCHES, type InteriorSwatch } from './interiors';
import type { PaintSwatch } from './paints';
import { prefersReducedMotion } from './reduced-motion';
import { RIM_FINISH_SWATCHES, type RimFinishSwatch } from './rim-finishes';
import { addSunroofPatch, setSunroof, slideSunroof } from './sunroof';
import { ThreeStudio } from './three-studio';
import { vehicleById, type VehicleId } from './vehicles';
import { applyWheelSize, NATIVE_WHEEL_INCH } from './wheel-size';

export { type CaptureOptions, type InspectHandle } from './inspect-controls';
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

/** 선루프 유리가 열리거나 닫히는 데 걸리는 시간(초) */
const SUNROOF_SECONDS = 0.9;

/** 이미지로 만들 때 차만 골라 쓰도록 뿌리에 이름을 붙인다. r3f의 객체는 외부 three.js 객체라 컴포넌트 밖 함수에서 직접 바꾼다. */
function nameVehicleModel(root: Object3D) {
  root.name = VEHICLE_MODEL_NAME;
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function GltfModel({
  files,
  paint,
  interior,
  caliper,
  rimFinish,
  sunroof = true,
  sunroofOpen = false,
  wheelInch,
  front,
  onReady,
}: {
  files: readonly string[];
  /** 없으면 모델 원래 색 */
  paint?: PaintSwatch;
  /** 없으면 모델 원래 실내(검정) */
  interior?: InteriorSwatch;
  /** 브레이크 캘리퍼 색. 없으면 모델 원래(회색). */
  caliper?: CaliperSwatch;
  /** 휠 림의 마감 색. 없으면 모델 원래(광택 검정). */
  rimFinish?: RimFinishSwatch;
  /** false 이면 선루프 구멍을 막는다. 기본은 선루프가 있는 모델 그대로. */
  sunroof?: boolean;
  /** 선루프 유리를 연다. 선루프가 있을 때만 뜻이 있다. */
  sunroofOpen?: boolean;
  /** 휠 크기(인치). 없으면 모델 원래 크기(21인치). 바꿔도 모델을 다시 불러오지 않는다. */
  wheelInch?: number;
  front?: VehicleFront;
  /** 모든 부품을 불러와 조립을 마쳤을 때 한 번 호출한다. */
  onReady?: () => void;
}) {
  const [model, setModel] = useState<Object3D | null>(null);
  const invalidate = useThree((state) => state.invalidate);
  const fileKey = files.join('|');
  // 선루프 유리가 연 정도(0~1)와 가려는 값. 막는 판이 보일 때는 열지 않는다.
  const slideRef = useRef({ current: 0, goal: 0 });

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
        // 크기와 방향을 맞춘 뒤에 만든다. 위아래 면을 월드 좌표로 가르기 때문이다.
        addSunroofPatch(root);
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
    setSunroof(model, sunroof);
    invalidate();
  }, [invalidate, model, sunroof]);

  useEffect(() => {
    if (!model) {
      return;
    }
    const slide = slideRef.current;
    slide.goal = sunroof && sunroofOpen ? 1 : 0;
    if (prefersReducedMotion()) {
      slide.current = slide.goal;
      slideSunroof(model, slide.goal);
    }
    invalidate();
  }, [invalidate, model, sunroof, sunroofOpen]);

  useFrame((_, delta) => {
    const slide = slideRef.current;
    if (!model || slide.current === slide.goal) {
      return;
    }
    const step = Math.min(delta, 0.05) / SUNROOF_SECONDS;
    slide.current =
      slide.current < slide.goal
        ? Math.min(slide.goal, slide.current + step)
        : Math.max(slide.goal, slide.current - step);
    slideSunroof(model, easeInOut(slide.current));
  });

  useEffect(() => {
    if (!model) {
      return;
    }
    applyThreeInterior(model, interior ?? INTERIOR_SWATCHES[0]);
    invalidate();
  }, [interior, invalidate, model]);

  useEffect(() => {
    if (!model) {
      return;
    }
    // `InspectHandle.capture`가 차만 골라 구도를 맞추려고 이 이름으로 찾는다(바닥의 그림자 판은 빼야 한다).
    nameVehicleModel(model);
  }, [model]);

  useEffect(() => {
    if (!model) {
      return;
    }
    applyThreeRim(model, rimFinish ?? RIM_FINISH_SWATCHES[0]);
    invalidate();
  }, [invalidate, model, rimFinish]);

  useEffect(() => {
    if (!model) {
      return;
    }
    applyThreeCaliper(model, caliper ?? CALIPER_SWATCHES[0]);
    invalidate();
  }, [caliper, invalidate, model]);

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
  /** 실내 색(시트, 도어 안쪽, 실내 라이닝). 없으면 모델 원래 실내(검정)입니다. 바꿔도 모델을 다시 불러오지 않습니다. */
  interior?: InteriorSwatch;
  /** 브레이크 캘리퍼 색. 휠 시점에서 림 사이로 보입니다. 없으면 모델 원래(회색)입니다. 바꿔도 모델을 다시 불러오지 않습니다. */
  caliper?: CaliperSwatch;
  /** 휠 림의 마감 색. 휠 시점에서 크게 보입니다. 없으면 모델 원래(광택 검정)입니다. 바꿔도 모델을 다시 불러오지 않습니다. */
  rimFinish?: RimFinishSwatch;
  /** false 이면 선루프 구멍을 막은 차를 보여 줍니다(지붕이 막힌 모양). 기본은 선루프가 있는 모델 그대로입니다. 바꿔도 모델을 다시 불러오지 않습니다. */
  sunroof?: boolean;
  /** 선루프 유리를 연다(뒤로 밀려 지붕 밑으로 들어갑니다). `sunroof`가 false 이면 뜻이 없습니다. 감소 모션이면 바로 열립니다. */
  sunroofOpen?: boolean;
  /** 줌 인·아웃과 리셋을 호스트가 제어할 때 넘깁니다. 드래그 회전과 휠 줌은 항상 켜져 있습니다. */
  inspectRef?: RefObject<InspectHandle | null>;
  /**
   * 카메라 시점. 기본은 앞 3/4 외관(`exterior`). 바뀌면 현재 위치에서 새 시점까지 부드럽게 움직입니다.
   * `seats`와 `dashboard`는 실내라서 확대 없이 제자리에서 둘러봅니다.
   */
  view?: CameraViewId;
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
  interior,
  caliper,
  rimFinish,
  sunroof,
  sunroofOpen,
  inspectRef,
  view = DEFAULT_CAMERA_VIEW,
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
      camera={{ position: [...CAMERA_VIEWS[view].position], fov: CAMERA_VIEWS[view].fov }}
      gl={{ alpha: true, antialias: true }}
      shadows={{ type: PCFShadowMap }}
    >
      <ThreeStudio />
      {inspectRef ? (
        <InspectControls
          cabinLight={(interior ?? INTERIOR_SWATCHES[0]).cabinLight}
          handleRef={inspectRef}
          view={view}
          wheelZoom={wheelZoom}
        />
      ) : null}
      {available ? (
        <GltfModel
          key={vehicle.id}
          files={vehicle.files}
          front={vehicle.front}
          onReady={onReady}
          caliper={caliper}
          rimFinish={rimFinish}
          interior={interior}
          paint={paint}
          sunroof={sunroof}
          sunroofOpen={sunroofOpen}
          wheelInch={wheelInch}
        />
      ) : null}
    </Canvas>
  );
}
