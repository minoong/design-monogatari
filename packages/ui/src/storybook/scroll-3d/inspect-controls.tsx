'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { type RefObject, useEffect, useRef } from 'react';
import { Vector3 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { STUDIO_CAMERA } from './constants';

export type InspectHandle = {
  reset: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
};

const TARGET = new Vector3(0, 0.55, 0);

export function InspectControls({ handleRef }: { handleRef: RefObject<InspectHandle | null> }) {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 2.4;
    controls.maxDistance = 14;
    controls.minPolarAngle = 0.18;
    controls.maxPolarAngle = Math.PI / 2 - 0.08;
    controls.target.copy(TARGET);
    camera.position.set(...STUDIO_CAMERA.position);
    controls.saveState();
    controls.update();
    controlsRef.current = controls;

    const onChange = () => {
      invalidate();
    };
    controls.addEventListener('change', onChange);

    const zoomBy = (factor: number) => {
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
        controls.reset();
        invalidate();
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
      controls.removeEventListener('change', onChange);
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl, handleRef, invalidate]);

  useFrame(() => {
    controlsRef.current?.update();
  });

  return null;
}
