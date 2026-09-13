'use client';

import { useFrame } from '@react-three/fiber';
import { type ReactNode, type RefObject, useRef } from 'react';
import type { Group } from 'three';

import { yawFromProgress } from './constants';

export function ThreeYawGroup({
  progressRef,
  children,
}: {
  progressRef: RefObject<number>;
  children: ReactNode;
}) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    const group = groupRef.current;
    if (group) {
      group.rotation.y = yawFromProgress(progressRef.current);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}
