'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { PerspectiveCamera } from 'three';

import { STUDIO_CAMERA } from './constants';

/** 이 비율(가로/세로) 이상이면 기본 시야각을 그대로 쓴다. */
const WIDE_ASPECT = 1.5;

/**
 * 캔버스가 세로로 길어지면(가로/세로 비율이 낮아지면) 세로 시야각을 넓혀 차의 가로 폭이 잘리지 않게 한다.
 * 가로 시야는 비율 1.5일 때와 같게 유지한다.
 */
export function AdaptiveFov() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera) || size.height === 0) {
      return;
    }
    const aspect = size.width / size.height;
    const base = (STUDIO_CAMERA.fov * Math.PI) / 360;
    const scale = Math.max(1, WIDE_ASPECT / aspect);
    // eslint-disable-next-line react-hooks/immutability -- r3f의 카메라는 외부 three.js 객체라 직접 바꾸는 것이 정해진 방식이다
    camera.fov = (2 * Math.atan(Math.tan(base) * scale) * 180) / Math.PI;
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, invalidate, size.height, size.width]);

  return null;
}
