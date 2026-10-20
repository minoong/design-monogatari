'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { type RefObject, useEffect, useRef } from 'react';
import {
  type Camera,
  type Mesh,
  PerspectiveCamera,
  type PointLight,
  type Scene,
  Spherical,
  Vector2,
  Vector3,
  type WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { fovForAspect } from './adaptive-fov';
import { CAMERA_VIEWS, type CameraViewId, isInsideView } from './camera-views';
import { VEHICLE_MODEL_NAME } from './constants';
import { prefersReducedMotion } from './reduced-motion';

export type InspectHandle = {
  /** 지금 시점의 처음 위치로 돌아간다. */
  reset: () => void;
  /** 실내 시점에서는 아무 일도 하지 않는다(제자리에서 둘러보기만 한다). */
  zoomIn: () => void;
  zoomOut: () => void;
  /**
   * 조준점을 중심으로 방향을 돌린다(드래그의 대안). 단위는 한 번 누르는 만큼의 걸음이다. 왼쪽은 `azimuth`가 음수, 위는 `polar`가 음수.
   * 실내에서는 제자리에서 둘러본다. 시점이 바뀌는 중에는 아무 일도 하지 않는다.
   */
  rotateBy: (azimuth: number, polar: number) => void;
  /**
   * 지금 장면(색, 휠, 선루프 등)을 고정된 앞 3/4 시점의 PNG로 만든다. 화면의 카메라와 상관없이 늘 같은 구도이고, 실내 시점에서
   * 불러도 실내용 조명이 섞이지 않는다. 화면에 보이는 장면과 같은 렌더러로 한 번 그린 뒤 바로 원래 크기와 카메라로 돌려서 깜빡이지 않는다.
   * 모델을 아직 불러오지 못했으면 차 없는 빈 그림이 나오므로 `onReady` 뒤에 부른다.
   */
  capture: (options?: CaptureOptions) => Promise<Blob | null>;
};

export type CaptureOptions = {
  /** 이미지 폭(px). 기본 1920 */
  width?: number;
  /** 이미지 높이(px). 기본 1080 */
  height?: number;
  /** 배경색(CSS 색). 장면은 투명이라 이 색 위에 얹는다. 기본 #f5f5f7 */
  background?: string;
};

/** `rotateBy` 한 걸음의 각도(라디안, 약 20°) */
const ROTATE_STEP = 0.35;

/** 시점이 바뀔 때 카메라가 움직이는 시간(초). 감소 모션이면 바로 옮긴다. */
const MOVE_SECONDS = 1.1;
/** 실내에서는 눈앞 이 거리의 한 점을 조준점으로 삼아 그 둘레를 돈다. 제자리에서 둘러보는 느낌이 된다. */
const INSIDE_ORBIT_RADIUS = 0.1;
/** 기본 실내 조명(검정 실내). 지붕이 햇빛과 그림자를 가려서 실내가 검게 보이므로 안쪽에서 보태 준다. */
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

/** 화면 반 폭·반 높이 중 큰 쪽에서 차가 이만큼까지 차지하게 맞춘다. 나머지는 여백이다. */
const STILL_FILL = 0.74;
/** 꼭짓점을 이 간격으로 건너뛰며 모은다. 윤곽의 가장자리는 이 정도 성기게 봐도 거의 같다. */
const VERTEX_STRIDE = 7;

/**
 * 보이는 메시의 꼭짓점을 월드 좌표로 모은다. 숨긴 부품(선루프 패치 등)과 바닥의 그림자 판은 빼야 구도가 틀어지지 않는다.
 * 경계 상자의 모서리로 맞추면 3/4 시점에서는 실제 윤곽보다 훨씬 커서 차가 작고 한쪽으로 치우친다.
 */
function vehiclePoints(scene: Scene): Vector3[] | null {
  const root = scene.getObjectByName(VEHICLE_MODEL_NAME);
  if (!root) return null;
  root.updateWorldMatrix(true, true);
  const points: Vector3[] = [];
  root.traverseVisible((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    const position = mesh.geometry.getAttribute('position');
    for (let index = 0; index < position.count; index += VERTEX_STRIDE) {
      points.push(
        new Vector3(position.getX(index), position.getY(index), position.getZ(index)).applyMatrix4(
          mesh.matrixWorld,
        ),
      );
    }
  });
  return points.length > 0 ? points : null;
}

/**
 * 앞 3/4 방향은 그대로 두고, 차의 윤곽(화면에 투영한 꼭짓점의 범위)이 가운데에 놓이고 `STILL_FILL`만큼 차지하도록
 * 조준점과 거리를 맞춘다. 원근 때문에 한 번에 풀리지 않아 몇 번 되풀이한다. 화면용 시점은 조작하는 무대에 맞춰 잡은 것이라
 * 가로로 긴 이미지에서는 차가 한쪽 구석에 작게 나왔다.
 */
function fitStill(still: PerspectiveCamera, points: Vector3[], direction: Vector3) {
  const target = new Vector3();
  for (const point of points) target.add(point);
  target.divideScalar(points.length);
  let distance = 6;
  const right = new Vector3();
  const up = new Vector3();
  const projected = new Vector3();

  for (let step = 0; step < 10; step += 1) {
    still.position.copy(target).addScaledVector(direction, distance);
    still.lookAt(target);
    still.updateMatrixWorld();
    still.updateProjectionMatrix();

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const point of points) {
      projected.copy(point).project(still);
      minX = Math.min(minX, projected.x);
      maxX = Math.max(maxX, projected.x);
      minY = Math.min(minY, projected.y);
      maxY = Math.max(maxY, projected.y);
    }
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const half = Math.max((maxX - minX) / 2, (maxY - minY) / 2);

    // 윤곽의 가운데가 화면 가운데로 오도록 조준점을 옮긴다(화면 위 한 칸의 실제 길이는 거리와 시야각으로 구한다).
    const halfHeight = distance * Math.tan((still.fov * Math.PI) / 360);
    right.setFromMatrixColumn(still.matrixWorld, 0);
    up.setFromMatrixColumn(still.matrixWorld, 1);
    target.addScaledVector(right, centerX * halfHeight * still.aspect);
    target.addScaledVector(up, centerY * halfHeight);
    distance *= half / STILL_FILL;
  }

  still.position.copy(target).addScaledVector(direction, distance);
  still.lookAt(target);
  still.updateMatrixWorld();
}

/**
 * 같은 렌더러로 정지 화면 한 장을 그려 2D 캔버스에 옮긴다. 화면 캔버스의 크기를 잠깐 바꿨다가 이 함수가 끝나기 전에
 * 원래 크기, 카메라, 조명으로 되돌려 다시 그리므로 화면에는 보이지 않는다(그리는 것과 되돌리는 것이 한 작업 안에서 끝난다).
 * 렌더 타깃에 따로 그리면 톤 매핑이 빠져 화면과 색이 달라져서 화면 캔버스를 그대로 쓴다.
 * r3f의 렌더러·장면은 외부 three.js 객체라 직접 바꾸는 것이 정해진 방식이어서 컴포넌트 밖 함수로 둔다.
 */
function renderStill(
  gl: WebGLRenderer,
  scene: Scene,
  liveCamera: Camera,
  cabinLight: PointLight | null,
  { width = 1920, height = 1080, background = '#f5f5f7' }: CaptureOptions,
): HTMLCanvasElement {
  const pose = poseOf('exterior');
  const aspect = width / height;
  const still = new PerspectiveCamera(fovForAspect(pose.fov, aspect), aspect, 0.02, 60);
  const points = vehiclePoints(scene);
  if (points) {
    fitStill(still, points, pose.position.clone().sub(pose.target).normalize());
  } else {
    still.position.copy(pose.position);
    still.lookAt(pose.target);
    still.updateMatrixWorld();
  }

  const size = gl.getSize(new Vector2());
  const pixelRatio = gl.getPixelRatio();
  const environment = scene.environmentIntensity;
  const light = cabinLight?.intensity ?? 0;

  const out = document.createElement('canvas');
  out.width = width;
  out.height = height;
  const context = out.getContext('2d');

  try {
    gl.setPixelRatio(1);
    gl.setSize(width, height, false);
    // 실내 시점에서 올려 둔 안쪽 조명과 환경광은 바깥에서 보면 과하게 밝다. 바깥 시점의 값으로 그린다.
    setEnvironmentIntensity(scene, 1);
    if (cabinLight) cabinLight.intensity = 0;
    gl.render(scene, still);
    if (context) {
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);
      context.drawImage(gl.domElement, 0, 0, width, height);
    }
  } finally {
    gl.setPixelRatio(pixelRatio);
    gl.setSize(size.x, size.y, false);
    setEnvironmentIntensity(scene, environment);
    if (cabinLight) cabinLight.intensity = light;
    gl.render(scene, liveCamera);
  }

  return out;
}

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
  cabinLight = CABIN_LIGHT,
  wheelZoom = true,
}: {
  handleRef: RefObject<InspectHandle | null>;
  /** 카메라 시점. 바뀌면 현재 위치에서 새 시점까지 부드럽게 움직인다. */
  view: CameraViewId;
  /** 실내 시점에서 더하는 조명. 실내 색에 맞춰 호스트가 정한다. */
  cabinLight?: { intensity: number; environment: number };
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
  const pendingRotateRef = useRef({ azimuth: 0, polar: 0 });
  const applyRotationRef = useRef<((azimuth: number, polar: number) => void) | null>(null);
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

    // 방향 버튼은 남은 회전량을 쌓아 두고 프레임마다 일부씩 적용해 부드럽게 돌린다(감소 모션이면 한 번에).
    const applyRotation = (azimuth: number, polar: number) => {
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new Spherical().setFromVector3(offset);
      spherical.theta += azimuth;
      const clamped = Math.min(
        controls.maxPolarAngle,
        Math.max(controls.minPolarAngle, spherical.phi + polar),
      );
      // 한계에 닿으면 남은 위아래 회전량은 버린다.
      if (clamped !== spherical.phi + polar) pendingRotateRef.current.polar = 0;
      spherical.phi = clamped;
      offset.setFromSpherical(spherical);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      invalidate();
    };
    applyRotationRef.current = applyRotation;

    const rotateBy = (azimuth: number, polar: number) => {
      if (tweenRef.current) return;
      // 실내에서는 눈앞의 점을 중심으로 도는 것이라 카메라 위치의 방향이 시선과 반대다. 버튼은 시선 방향으로 읽히게 뒤집는다.
      const sign = isInsideView(viewRef.current) ? -1 : 1;
      const turn = azimuth * sign * ROTATE_STEP;
      const tilt = polar * sign * ROTATE_STEP;
      if (prefersReducedMotion()) {
        applyRotation(turn, tilt);
        return;
      }
      pendingRotateRef.current.azimuth += turn;
      pendingRotateRef.current.polar += tilt;
      invalidate();
    };

    handleRef.current = {
      capture: (options = {}) =>
        new Promise<Blob | null>((resolve) => {
          const still = renderStill(gl, scene, camera, cabinLightRef.current, options);
          still.toBlob(resolve, 'image/png');
        }),
      rotateBy,
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
      pendingRotateRef.current = { azimuth: 0, polar: 0 };
      applyRotationRef.current = null;
      controls.removeEventListener('change', onChange);
      controls.dispose();
      canvasElement.style.setProperty('touch-action', previousTouchAction);
      controlsRef.current = null;
    };
  }, [camera, gl, handleRef, invalidate, scene, wheelZoom]);

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

    // 쌓아 둔 방향 버튼 회전량을 일부씩 적용한다.
    const pending = pendingRotateRef.current;
    if (pending.azimuth !== 0 || pending.polar !== 0) {
      const share = 1 - Math.exp(-dt * 14);
      const done = (rest: number) => (Math.abs(rest) < 0.002 ? rest : rest * share);
      const turn = done(pending.azimuth);
      const tilt = done(pending.polar);
      pending.azimuth -= turn;
      pending.polar -= tilt;
      applyRotationRef.current?.(turn, tilt);
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
      cabinLightRef.current.intensity = cabinLight.intensity * cabinBlendRef.current;
    }
    setEnvironmentIntensity(scene, 1 + (cabinLight.environment - 1) * cabinBlendRef.current);

    controls.update();
  });

  return <pointLight ref={cabinLightRef} decay={1.4} intensity={0} position={[0, 0.6, 0.1]} />;
}
