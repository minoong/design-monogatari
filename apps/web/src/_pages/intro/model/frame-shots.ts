/**
 * 인트로가 스크롤로 넘기는 미리 렌더한 프레임의 목록과 카메라 경로. 3D 차량을 페이지 스크롤에 직접 묶지 않고(규칙
 * `.claude/rules/animation.md`), 같은 3D 모델로 장면을 이미지 프레임으로 미리 뽑아 둔다. 프레임은 개발 전용 화면
 * `/dev/intro-frames`가 이 목록대로 그려서 `public/intro/` 아래에 저장한다(절차: `apps/web/AGENTS.md`).
 *
 * 좌표는 `@repo/vehicle-3d`의 월드 좌표다: 차 길이 약 4.2, 앞쪽 +Z, 운전석 쪽 +X, 바닥 y=-0.62.
 */

export type Vec3 = readonly [number, number, number];

export interface CameraPose {
  position: Vec3;
  target: Vec3;
  fov: number;
}

/** 이미지 크기. `lg`는 넓은 화면, `sm`은 좁은 화면(휴대폰)용이다. 둘 다 16:9이고 그리는 쪽이 칸에 맞춘다. */
export const FRAME_SIZES = {
  lg: { width: 1600, height: 900 },
  sm: { width: 960, height: 540 },
} as const;

export type FrameSize = keyof typeof FRAME_SIZES;

/** 프레임 장면에 칠하는 사양. 견적 카탈로그의 id다. */
export interface ShotLook {
  color: string;
  wheel: 'w19' | 'w20' | 'w21';
  interior: string;
}

/** 시퀀스 프레임의 장면은 모두 같은 차다. 검정 바탕에서 윤곽이 또렷한 흰색에, 가장 큰 휠을 끼운다. */
const HERO_LOOK: ShotLook = { color: 'white', wheel: 'w21', interior: 'black' };

type Path =
  | {
      kind: 'orbit';
      from: number;
      to: number;
      radius: number;
      height: number;
      target: Vec3;
      fov: number;
    }
  | { kind: 'keys'; keys: readonly CameraPose[] };

export interface SequenceShot {
  id: 'reveal' | 'orbit' | 'wheel' | 'cabin';
  /** 프레임 수 */
  count: number;
  path: Path;
  /** 카메라가 차 안에 있는 장면이면 실내 조명을 켜고, 유리 너머가 빈 면이 아니라 스튜디오로 보이게 환경을 배경으로 그린다. */
  cabin: boolean;
  look: ShotLook;
}

/** 각도(도)를 받아 차 둘레의 카메라 위치로. 0°는 정면(+Z), 90°는 운전석 옆(+X)이다. */
function around(degrees: number, radius: number, height: number): Vec3 {
  const radians = (degrees * Math.PI) / 180;
  return [Math.sin(radians) * radius, height, Math.cos(radians) * radius];
}

export const SEQUENCES: readonly SequenceShot[] = [
  {
    // 히어로: 거의 정면 먼 곳에서 앞 3/4로 돌며 다가온다. 페이지를 열면 한 번 재생된다(스크롤과 무관).
    id: 'reveal',
    count: 48,
    cabin: false,
    look: HERO_LOOK,
    path: {
      kind: 'keys',
      keys: [
        { position: around(8, 11.5, 0.55), target: [0, 0.35, 0], fov: 26 },
        { position: around(28, 9.2, 0.75), target: [0, 0.4, 0], fov: 27 },
        { position: around(46, 7.6, 0.95), target: [0, 0.42, 0], fov: 28 },
      ],
    },
  },
  {
    // 360° 회전: 앞 3/4에서 출발해 한 바퀴 남짓 돌아 운전석 옆모습에서 멈춘다. 마지막 장면에 콜아웃이 붙는다.
    id: 'orbit',
    count: 120,
    cabin: false,
    look: HERO_LOOK,
    path: {
      kind: 'orbit',
      from: 46,
      to: 450,
      radius: 7.6,
      height: 0.95,
      target: [0, 0.42, 0],
      fov: 28,
    },
  },
  {
    // 휠: 옆모습에서 앞바퀴로 다가가 림이 화면을 채운다.
    id: 'wheel',
    count: 48,
    cabin: false,
    look: HERO_LOOK,
    path: {
      kind: 'keys',
      keys: [
        { position: around(90, 7.6, 0.95), target: [0, 0.42, 0], fov: 28 },
        { position: [4.2, 0.35, 2.6], target: [0.6, -0.15, 1.3], fov: 30 },
        { position: [2.35, -0.05, 1.75], target: [0.85, -0.25, 1.36], fov: 32 },
      ],
    },
  },
  {
    // 실내: 차 위에서 선루프 너머로 내려다보다가 운전석 눈높이로 내려와 앞을 본다.
    id: 'cabin',
    count: 72,
    cabin: true,
    // 내장은 견적의 기본값(블랙)과 같게 둔다. 아래 내장 고르기 구역의 첫 장면과 같은 차로 보인다.
    look: HERO_LOOK,
    path: {
      kind: 'keys',
      keys: [
        { position: [2.6, 4.2, -3.2], target: [0.2, 0.2, 0], fov: 34 },
        { position: [0.5, 2.4, -0.9], target: [0.25, 0.3, 0.4], fov: 46 },
        { position: [0.36, 0.9, -0.35], target: [0.25, 0.42, 0.9], fov: 62 },
        { position: [0.34, 0.5, -0.1], target: [0.2, 0.35, 1.2], fov: 70 },
      ],
    },
  },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

/** 시작과 끝이 부드러운 가감속. 스크롤이 일정하게 움직여도 카메라는 출발과 도착에서 천천히 움직인다. */
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** 경로 위 진행도 `t`(0–1)의 카메라. 키 경로는 키 사이를 Catmull-Rom 대신 구간별 선형 + 전체 가감속으로 잇는다. */
export function poseAt(path: Path, t: number): CameraPose {
  const clamped = Math.min(1, Math.max(0, t));
  if (path.kind === 'orbit') {
    const degrees = lerp(path.from, path.to, easeInOut(clamped));
    return {
      position: around(degrees, path.radius, path.height),
      target: path.target,
      fov: path.fov,
    };
  }
  const { keys } = path;
  const eased = easeInOut(clamped) * (keys.length - 1);
  const index = Math.min(keys.length - 2, Math.floor(eased));
  const local = eased - index;
  const a = keys[index] as CameraPose;
  const b = keys[index + 1] as CameraPose;
  return {
    position: lerp3(a.position, b.position, local),
    target: lerp3(a.target, b.target, local),
    fov: lerp(a.fov, b.fov, local),
  };
}

/** 프레임 번호(0부터)의 파일 경로. `public/` 아래 기준이다. */
export function sequenceFrame(id: SequenceShot['id'], size: FrameSize, index: number) {
  return `/intro/frames/${id}/${size}/${String(index).padStart(4, '0')}.webp`;
}

export function sequenceFrames(id: SequenceShot['id'], size: FrameSize) {
  const shot = SEQUENCES.find((item) => item.id === id);
  return Array.from({ length: shot?.count ?? 0 }, (_, index) => sequenceFrame(id, size, index));
}

/** 구성기(색·휠 고르기)의 정지 장면: 외관은 색 × 휠, 실내는 내장 색마다 한 장. */
export const STILL_EXTERIOR: CameraPose = {
  position: around(46, 7.6, 0.95),
  target: [0, 0.42, 0],
  fov: 28,
};

export const STILL_INTERIOR: CameraPose = {
  position: [0.34, 0.5, -0.1],
  target: [0.2, 0.35, 1.2],
  fov: 70,
};

export function exteriorStill(size: FrameSize, color: string, wheel: string) {
  return `/intro/stills/${size}/exterior-${color}-${wheel}.webp`;
}

export function interiorStill(size: FrameSize, interior: string) {
  return `/intro/stills/${size}/interior-${interior}.webp`;
}
