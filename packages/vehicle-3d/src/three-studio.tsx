'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { PMREMGenerator, type Texture } from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

import { GROUND_Y, HDR_URL } from './constants';

export function ThreeStudio() {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    camera.lookAt(0, 0.55, 0);
  }, [camera]);

  useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    let cancelled = false;
    let envMap: Texture | undefined;

    const apply = (texture: Texture) => {
      if (cancelled) {
        texture.dispose();
        return;
      }
      scene.environment = texture;
      envMap = texture;
      // 환경맵은 나중에 도착하므로 도착하면 다시 그려야 반사가 나타난다(필요할 때만 그리는 모드).
      invalidate();
    };

    const useRoom = () => {
      const room = new RoomEnvironment();
      const texture = pmrem.fromScene(room, 0.04).texture;
      room.dispose();
      apply(texture);
    };

    const loader = new HDRLoader();
    loader.load(
      HDR_URL,
      (hdr) => {
        const texture = pmrem.fromEquirectangular(hdr).texture;
        hdr.dispose();
        apply(texture);
      },
      undefined,
      useRoom,
    );

    return () => {
      cancelled = true;
      scene.environment = null;
      envMap?.dispose();
      pmrem.dispose();
    };
  }, [gl, invalidate, scene]);

  return (
    <>
      <ambientLight intensity={0.18} />
      <directionalLight
        castShadow
        intensity={1.2}
        position={[6, 9, 4]}
        shadow-mapSize={[1024, 1024]}
      />
      <mesh position={[0, GROUND_Y, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[5.5, 64]} />
        <shadowMaterial opacity={0.32} transparent />
      </mesh>
    </>
  );
}
