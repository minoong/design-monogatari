import { type Material, type Mesh, MeshStandardMaterial, type Object3D } from 'three';

export type PartSurface = { color: string; roughness: number; metalness: number };

function originals(mesh: Mesh, key: string) {
  if (!mesh.userData[key]) {
    mesh.userData[key] = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  }
  return mesh.userData[key] as Material[];
}

/**
 * 이름이 `partName`에 맞는 메시의 재질에 색을 입힌다(캘리퍼, 림처럼 재질 하나를 통째로 칠하는 부품용). `surface`가 null 이면
 * 원래 재질로 되돌린다. 원래 재질은 `storeKey`로 메시에 한 번만 기억해 두고, 칠하려고 복제한 재질은 해제한다.
 * 차체 도장은 휠 부품을 건드리지 않으므로(`is-car-paint`) 겹치지 않는다.
 */
export function applyThreePartSurface(
  root: Object3D,
  partName: RegExp,
  storeKey: string,
  surface: PartSurface | null,
) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh || !partName.test(mesh.name)) return;

    const source = originals(mesh, storeKey);
    const current = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const next = source.map((material) => {
      if (!surface || !(material instanceof MeshStandardMaterial)) return material;
      const tinted = material.clone();
      tinted.color.set(surface.color);
      tinted.roughness = surface.roughness;
      tinted.metalness = surface.metalness;
      tinted.needsUpdate = true;
      return tinted;
    });

    for (const material of current) {
      if (!source.includes(material)) material.dispose();
    }
    mesh.material = Array.isArray(mesh.material) ? next : (next[0] ?? mesh.material);
  });
}
