/**
 * 카메라 시점. 좌표는 모델을 맞춘 뒤의 월드 좌표다(차 길이 약 4.2, 앞쪽이 +Z, 운전석 쪽이 +X, 바닥 y=-0.62).
 * `x5`와 `x5-web`은 같은 모델이라 같은 값을 쓴다. 값은 브라우저에서 카메라를 직접 놓아 보고 정했다.
 */
export const CAMERA_VIEWS = {
  /** 처음 보이는 앞 3/4 시점. 드래그로 돌리고 확대한다. */
  exterior: {
    label: '외관',
    position: [4.6, 1.55, 5.4],
    target: [0, 0.55, 0],
    fov: 32,
    inside: false,
    minDistance: 2.4,
    maxDistance: 14,
  },
  /** 앞바퀴 가까이. 림과 브레이크가 보인다. 가까이 가려고 최소 거리를 줄였다. */
  wheel: {
    label: '휠',
    position: [2.0, 0, 2.7],
    target: [0.7, -0.3, 1.35],
    fov: 35,
    inside: false,
    minDistance: 0.9,
    maxDistance: 2.6,
  },
  /** 앞좌석 사이에서 뒤쪽을 본다. 앞좌석, 뒷좌석, 천장이 한눈에 보인다. */
  seats: {
    label: '시트',
    position: [0, 0.55, 0.45],
    target: [0, 0.2, -1.5],
    fov: 75,
    inside: true,
  },
  /** 운전자 눈높이에서 앞을 본다. 대시보드와 핸들이 보인다. */
  dashboard: {
    label: '대시보드',
    position: [0.34, 0.5, -0.1],
    target: [0.2, 0.35, 1.2],
    fov: 70,
    inside: true,
  },
} as const;

export type CameraViewId = keyof typeof CAMERA_VIEWS;

export const CAMERA_VIEW_IDS = Object.keys(CAMERA_VIEWS) as CameraViewId[];

export const DEFAULT_CAMERA_VIEW: CameraViewId = 'exterior';

/** 실내 시점인지. 실내에서는 확대가 없고 제자리에서 둘러본다. */
export function isInsideView(view: CameraViewId) {
  return CAMERA_VIEWS[view].inside;
}
