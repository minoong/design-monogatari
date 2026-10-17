import { CAMERA_VIEWS } from '@repo/vehicle-3d/views';
import { describe, expect, it } from 'vitest';

import { isInsideView, STAGE_VIEW_BY_STEP, STAGE_VIEW_OPTIONS, stageViewOf } from './stage-view';
import { STEPS } from './steps';

describe('stage-view', () => {
  it('모든 단계가 존재하는 카메라 시점을 가진다', () => {
    for (const step of STEPS) {
      expect(CAMERA_VIEWS).toHaveProperty(stageViewOf(step.id));
    }
    expect(Object.keys(STAGE_VIEW_BY_STEP)).toHaveLength(STEPS.length);
  });

  it('휠 단계는 휠, 시트 단계는 시트, 내장 단계는 대시보드를 보여 준다', () => {
    expect(stageViewOf('wheel')).toBe('wheel');
    expect(stageViewOf('seat')).toBe('seats');
    expect(stageViewOf('interior')).toBe('dashboard');
  });

  it('실내 시점은 시트와 대시보드뿐이다', () => {
    expect(STAGE_VIEW_OPTIONS.filter((option) => isInsideView(option.id)).map((o) => o.id)).toEqual(
      ['seats', 'dashboard'],
    );
  });
});
