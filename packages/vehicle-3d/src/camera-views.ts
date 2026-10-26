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

/**
 * 무대 아래 조작의 이름. 웹 앱과 Storybook이 같은 말을 쓰도록 한곳에 둔다(따로 쓰다가 표현이 어긋났었다).
 * 보이는 글자가 있는 버튼의 접근성 이름은 그 글자를 포함해야 한다.
 */
export const CAMERA_CONTROL_LABELS = {
  viewGroup: '카메라 시점',
  zoomIn: '확대',
  zoomOut: '축소',
  reset: '처음 시점',
  sunroofOpen: '선루프 열기',
  rotateGroup: '방향 돌리기',
  rotateLeft: '왼쪽으로 돌리기',
  rotateRight: '오른쪽으로 돌리기',
  rotateUp: '위로 돌리기',
  rotateDown: '아래로 돌리기',
} as const;

/** 실내 시점 안내의 앞 문장: 보이는 것이 근사값임을 알린다. */
export const INSIDE_VIEW_NOTE_APPROX =
  '실내 색은 근사값이고 시트 구성과 가니쉬는 반영되지 않습니다.';
/** 실내 시점 안내의 뒤 문장: 확대가 꺼지는 이유. 좁은 화면에서는 비활성 버튼이 이미 보여 주므로 화면에서는 생략할 수 있다. */
export const INSIDE_VIEW_NOTE_NO_ZOOM = '실내에서는 확대할 수 없습니다.';
/** 실내 시점에서 보이는 안내 전체(낭독기와 Storybook은 이 전체를 쓴다). */
export const INSIDE_VIEW_NOTE = `${INSIDE_VIEW_NOTE_APPROX} ${INSIDE_VIEW_NOTE_NO_ZOOM}`;
