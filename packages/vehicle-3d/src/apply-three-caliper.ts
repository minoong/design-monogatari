import { type Material, type Mesh, MeshStandardMaterial, type Object3D } from 'three';

import type { CaliperSwatch } from './calipers';

const ORIGINAL_KEY = 'originalCaliperMaterials';
const CALIPER_MESH = /brake_caliper/i;

function originals(mesh: Mesh) {
  if (!mesh.userData[ORIGINAL_KEY]) {
    mesh.userData[ORIGINAL_KEY] = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  }
  return mesh.userData[ORIGINAL_KEY] as Material[];
}

/**
 * 브레이크 캘리퍼 색을 입힌다. `surface`가 null 이면 원래 재질로 되돌린다. 차체 도장은 휠 부품을 건드리지 않으므로
 * (`is-car-paint`) 둘이 겹치지 않는다.
 */
export function applyThreeCaliper(root: Object3D, caliper: CaliperSwatch) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh || !CALIPER_MESH.test(mesh.name)) return;

    const source = originals(mesh);
    const current = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const next = source.map((material) => {
      if (!caliper.surface || !(material instanceof MeshStandardMaterial)) return material;
      const tinted = material.clone();
      tinted.color.set(caliper.surface.color);
      tinted.roughness = caliper.surface.roughness;
      tinted.metalness = caliper.surface.metalness;
      tinted.needsUpdate = true;
      return tinted;
    });

    for (const material of current) {
      if (!source.includes(material)) material.dispose();
    }
    mesh.material = Array.isArray(mesh.material) ? next : (next[0] ?? mesh.material);
  });
}
