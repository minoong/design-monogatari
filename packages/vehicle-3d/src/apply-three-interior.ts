import {
  type Material,
  type Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Object3D,
} from 'three';

import type { InteriorRole, InteriorSurface, InteriorSwatch } from './interiors';

const ORIGINAL_KEY = 'originalInteriorMaterials';

/**
 * 메시 이름으로 실내의 어느 부분인지 가른다. `*_none`(트림 조각)과 바닥은 건드리지 않는다. 한 메시 안은 나눌 수 없어서
 * 대시보드는 윗면과 아랫면을 따로 칠하지 못하고 통째로 한 색이다.
 * 도어 안쪽 이름(`Door_F_interior`)은 도장 쪽에서 `interior` 때문에 이미 건너뛰므로 둘이 겹치지 않는다.
 */
function interiorRole(meshName: string): InteriorRole | null {
  const name = meshName.toLowerCase();
  if (/seats_[fb]_common_general/.test(name)) return 'seat';
  if (/interior_color_common_general|door_[fb]_interior/.test(name)) return 'panel';
  if (/interior_common_general/.test(name)) return 'shell';
  if (/steeringwheel_common_general/.test(name)) return 'wheel';
  if (/dashboard_common_general/.test(name)) return 'dash';
  return null;
}

function originals(mesh: Mesh) {
  if (!mesh.userData[ORIGINAL_KEY]) {
    mesh.userData[ORIGINAL_KEY] = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  }
  return mesh.userData[ORIGINAL_KEY] as Material[];
}

function disposeIfClone(material: Material, source: Material[]) {
  if (!source.includes(material)) material.dispose();
}

function tinted(source: Material, surface: InteriorSurface) {
  // 물리 기반 재질로 바꿔 반사 세기(specularIntensity)를 낮춘다. 표준 재질은 반사를 줄일 수 없어서,
  // 밝은 장면 조명의 흰 반사가 어두운 색 위에 얹혀 갈색이 분홍빛 회색으로 바랜다.
  const next = new MeshPhysicalMaterial();
  if (source instanceof MeshPhysicalMaterial) {
    next.copy(source);
  } else {
    // 표준 재질을 `MeshPhysicalMaterial.copy`에 그대로 넘기면 없는 clearcoat 필드를 읽다가 오류가 난다.
    // 표준 재질의 복사만 해서 공통 필드(색, 거칠기, 법선, 면 방향 등)를 옮긴다.
    MeshStandardMaterial.prototype.copy.call(next, source);
  }
  next.color.set(surface.color);
  next.roughness = surface.roughness;
  next.metalness = surface.metalness;
  next.specularIntensity = surface.specular;
  next.needsUpdate = true;
  return next;
}

/** 실내 색을 입힌다. `surfaces`가 null 이면 원래대로 되돌린다. 원래 재질은 처음 한 번만 기억해 둔다. */
export function applyThreeInterior(root: Object3D, interior: InteriorSwatch) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) return;
    const role = interiorRole(mesh.name);
    if (!role) return;

    const source = originals(mesh);
    const current = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const surface = interior.surfaces?.[role];
    const next = source.map((material) =>
      surface && material instanceof MeshStandardMaterial ? tinted(material, surface) : material,
    );

    for (const material of current) disposeIfClone(material, source);
    mesh.material = Array.isArray(mesh.material) ? next : (next[0] ?? mesh.material);
  });
}
