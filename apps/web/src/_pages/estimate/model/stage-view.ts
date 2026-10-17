import { CAMERA_VIEWS, type CameraViewId } from '@repo/vehicle-3d/views';

import type { StepId } from './steps';

/**
 * 단계마다 3D 무대가 보여 줄 카메라 시점. 휠 단계는 앞바퀴, 시트 단계는 실내 뒷자리 방향, 내장 단계는
 * 운전석에서 본 대시보드이고, 나머지는 차 전체가 보이는 외관이다.
 */
export const STAGE_VIEW_BY_STEP: Record<StepId, CameraViewId> = {
  model: 'exterior',
  exterior: 'exterior',
  wheel: 'wheel',
  seat: 'seats',
  interior: 'dashboard',
  options: 'exterior',
  accessories: 'exterior',
  result: 'exterior',
};

export function stageViewOf(step: StepId): CameraViewId {
  return STAGE_VIEW_BY_STEP[step];
}

/** 무대 아래 버튼으로 고를 수 있는 시점과 그 이름 */
export const STAGE_VIEW_OPTIONS = (Object.keys(CAMERA_VIEWS) as CameraViewId[]).map((id) => ({
  id,
  label: CAMERA_VIEWS[id].label,
}));

export function isInsideView(view: CameraViewId) {
  return CAMERA_VIEWS[view].inside;
}
