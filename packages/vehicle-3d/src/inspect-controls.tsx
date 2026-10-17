'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { type RefObject, useEffect, useRef } from 'react';
import { type Camera, PerspectiveCamera, type PointLight, type Scene, Vector3 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { fovForAspect } from './adaptive-fov';
import { CAMERA_VIEWS, type CameraViewId, isInsideView } from './camera-views';

export type InspectHandle = {
  /** 지금 시점의 처음 위치로 돌아간다. */
  reset: () => void;
  /** 실내 시점에서는 아무 일도 하지 않는다(제자리에서 둘러보기만 한다). */
  zoomIn: () => void;
  zoomOut: () => void;
};

/** 시점이 바뀔 때 카메라가 움직이는 시간(초). 감소 모션이면 바로 옮긴다. */
const MOVE_SECONDS = 1.1;
/** 실내에서는 눈앞 이 거리의 한 점을 조준점으로 삼아 그 둘레를 돈다. 제자리에서 둘러보는 느낌이 된다. */
const INSIDE_ORBIT_RADIUS = 0.1;
/** 실내 조명. 지붕이 햇빛과 그림자를 가려서 실내가 검게 보이므로 안쪽에서 보태 준다. */
const CABIN_LIGHT = { intensity: 6, environment: 3 };

type Pose = { position: Vector3; target: Vector3; fov: number };

function poseOf(view: CameraViewId): Pose {
  const spec = CAMERA_VIEWS[view];
  const position = new Vector3(...spec.position);
  const target = new Vector3(...spec.target);
  if (spec.inside) {
    target.sub(position).setLength(INSIDE_ORBIT_RADIUS).add(position);
  }
  return { position, target, fov: spec.fov };
}

// r3f의 카메라와 장면은 외부 three.js 객체라 직접 바꾸는 것이 정해진 방식이다. 컴포넌트 밖의 함수로 두어 그 경계를 분명히 한다.
function setClipPlanes(camera: Camera) {
  if (!(camera instanceof PerspectiveCamera)) return;
  // 실내에서는 눈앞 몇 센티미터까지 가까워지므로 가까운 면을 기본값(0.1)보다 당긴다.
  camera.near = 0.02;
  camera.far = 60;
  camera.updateProjectionMatrix();
}

function setEnvironmentIntensity(scene: Scene, value: number) {
  scene.environmentIntensity = value;
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function applyViewLimits(controls: OrbitControls, view: CameraViewId, wheelZoom: boolean) {
  const spec = CAMERA_VIEWS[view];
  controls.enableRotate = true;
  if (spec.inside) {
    controls.enableZoom = false;
    controls.minDistance = INSIDE_ORBIT_RADIUS;
    controls.maxDistance = INSIDE_ORBIT_RADIUS;
    // 위로는 수평에서 0.45rad(약 26°), 아래로는 0.2rad(약 11°)까지만. 더 젖히면 원근 때문에 화면이 기울어 보이고,
    // 시트 시점에서 약 17° 넘게 내리면 화면 윗부분에 짐칸 안쪽의 평평한 검은 면이 크게 보인다.
    // polar 각도는 조준점에서 본 카메라 위치의 각도라서 아래를 내려다보는 쪽이 최소값이다(수평이 π/2).
    controls.minPolarAngle = Math.PI / 2 - 0.2;
    controls.maxPolarAngle = Math.PI / 2 + 0.45;
    controls.rotateSpeed = 0.4;
    return;
  }
  controls.enableZoom = wheelZoom;
  controls.minDistance = spec.minDistance;
  controls.maxDistance = spec.maxDistance;
  controls.minPolarAngle = 0.18;
  controls.maxPolarAngle = Math.PI / 2 - 0.08;
  controls.rotateSpeed = 1;
}

/** 이동하는 동안에는 한계를 풀고 입력을 막는다. 한계가 켜져 있으면 중간 지점이 한계 안으로 끌려 들어간다. */
function openLimits(controls: OrbitControls) {
  controls.enableRotate = false;
  controls.enableZoom = false;
  controls.minDistance = 0;
  controls.maxDistance = 100;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;
}

export function InspectControls({
  handleRef,
  view,
  wheelZoom = true,
}: {
  handleRef: RefObject<InspectHandle | null>;
  /** 카메라 시점. 바뀌면 현재 위치에서 새 시점까지 부드럽게 움직인다. */
  view: CameraViewId;
  /** false 이면 휠·핀치 확대를 끈다. 스크롤되는 페이지 안에서 휠이 페이지 스크롤을 가로채지 않게 한다(확대는 `handleRef`로). */
  wheelZoom?: boolean;
}) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cabinLightRef = useRef<PointLight>(null);
  const viewRef = useRef(view);
  const appliedViewRef = useRef<CameraViewId | null>(null);
  const goToRef = useRef<((next: CameraViewId, animate: boolean) => void) | null>(null);
  const tweenRef = useRef<{ from: Pose; to: Pose; elapsed: number; duration: number } | null>(null);
  // 화면 비율을 반영하기 전의 세로 시야각
  const baseFovRef = useRef<number>(CAMERA_VIEWS[view].fov);
  const aspectRef = useRef(1);
  const cabinBlendRef = useRef(isInsideView(view) ? 1 : 0);

  const applyFov = (): void => {
    if (!(camera instanceof PerspectiveCamera)) return;
    // eslint-disable-next-line react-hooks/immutability -- r3f의 카메라는 외부 three.js 객체라 직접 바꾸는 것이 정해진 방식이다
    camera.fov = fovForAspect(baseFovRef.current, aspectRef.current);
    camera.updateProjectionMatrix();
  };
  const applyFovRef = useRef(applyFov);
  useEffect(() => {
    applyFovRef.current = applyFov;
  });

  useEffect(() => {
    aspectRef.current = size.height === 0 ? 1 : size.width / size.height;
    applyFovRef.current();
    invalidate();
  }, [invalidate, size.height, size.width]);

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    // 확대를 끈 쪽은 스크롤되는 페이지 안이다. 세로로 쓸어 넘기는 터치는 페이지 스크롤에 내주고, 가로 드래그만 회전에 쓴다.
    const canvasElement = gl.domElement;
    const previousTouchAction = canvasElement.style.getPropertyValue('touch-action');
    if (!wheelZoom) canvasElement.style.setProperty('touch-action', 'pan-y');

    setClipPlanes(camera);

    const place = (next: CameraViewId) => {
      const pose = poseOf(next);
      camera.position.copy(pose.position);
      controls.target.copy(pose.target);
      baseFovRef.current = pose.fov;
      applyFovRef.current();
      applyViewLimits(controls, next, wheelZoom);
      controls.update();
      appliedViewRef.current = next;
    };

    place(viewRef.current);
    controls.saveState();
    controlsRef.current = controls;

    goToRef.current = (next, animate) => {
      viewRef.current = next;
      if (!animate || prefersReducedMotion()) {
        tweenRef.current = null;
        place(next);
        invalidate();
        return;
      }
      openLimits(controls);
      tweenRef.current = {
        from: {
          position: camera.position.clone(),
          target: controls.target.clone(),
          fov: baseFovRef.current,
        },
        to: poseOf(next),
        elapsed: 0,
        duration: MOVE_SECONDS,
      };
      appliedViewRef.current = next;
      invalidate();
    };

    const onChange = () => {
      invalidate();
    };
    controls.addEventListener('change', onChange);

    const zoomBy = (factor: number) => {
      if (isInsideView(viewRef.current) || tweenRef.current) return;
      const offset = camera.position.clone().sub(controls.target);
      const next = Math.min(
        controls.maxDistance,
        Math.max(controls.minDistance, offset.length() * factor),
      );
      offset.setLength(next);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      invalidate();
    };

    handleRef.current = {
      reset: () => {
        goToRef.current?.(viewRef.current, true);
      },
      zoomIn: () => {
        zoomBy(0.82);
      },
      zoomOut: () => {
        zoomBy(1.22);
      },
    };

    return () => {
      handleRef.current = null;
      goToRef.current = null;
      tweenRef.current = null;
      controls.removeEventListener('change', onChange);
      controls.dispose();
      canvasElement.style.setProperty('touch-action', previousTouchAction);
      controlsRef.current = null;
    };
  }, [camera, gl, handleRef, invalidate, wheelZoom]);

  useEffect(() => {
    viewRef.current = view;
    if (appliedViewRef.current !== null && appliedViewRef.current !== view) {
      goToRef.current?.(view, true);
    }
  }, [view]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;
    const dt = Math.min(delta, 0.05);

    const tween = tweenRef.current;
    if (tween) {
      tween.elapsed += dt;
      const progress = Math.min(1, tween.elapsed / tween.duration);
      const eased = easeInOut(progress);
      camera.position.lerpVectors(tween.from.position, tween.to.position, eased);
      controls.target.lerpVectors(tween.from.target, tween.to.target, eased);
      baseFovRef.current = tween.from.fov + (tween.to.fov - tween.from.fov) * eased;
      applyFovRef.current();
      if (progress >= 1) {
        tweenRef.current = null;
        applyViewLimits(controls, viewRef.current, wheelZoom);
      }
    }

    // 실내로 들어가면 안쪽 조명과 환경광을 부드럽게 올리고, 나오면 내린다.
    const goal = isInsideView(viewRef.current) ? 1 : 0;
    const blend = cabinBlendRef.current;
    if (Math.abs(goal - blend) > 0.001) {
      cabinBlendRef.current = blend + (goal - blend) * Math.min(1, dt * 4);
    } else {
      cabinBlendRef.current = goal;
    }
    if (cabinLightRef.current) {
      cabinLightRef.current.intensity = CABIN_LIGHT.intensity * cabinBlendRef.current;
    }
    setEnvironmentIntensity(scene, 1 + (CABIN_LIGHT.environment - 1) * cabinBlendRef.current);

    controls.update();
  });

  return <pointLight ref={cabinLightRef} decay={1.4} intensity={0} position={[0, 0.6, 0.1]} />;
}
