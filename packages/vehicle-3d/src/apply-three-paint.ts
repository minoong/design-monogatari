import {
  type Material,
  type Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Object3D,
} from 'three';

import { paintRole } from './is-car-paint';
import type { PaintSwatch } from './paints';

const ORIGINAL_KEY = 'originalMaterials';

export type ThreePaint = {
  body: string;
  bumper: string;
  metalness: number;
  roughness: number;
  /** 0이면 광택층 없는 무광 */
  clearcoat: number;
};

export function threePaintFromSwatch(paint: PaintSwatch): ThreePaint {
  return {
    body: paint.hex,
    bumper: paint.bumperHex,
    metalness: paint.metalness,
    roughness: paint.roughness,
    clearcoat: paint.clearcoat,
  };
}

function originals(mesh: Mesh) {
  if (!mesh.userData[ORIGINAL_KEY]) {
    mesh.userData[ORIGINAL_KEY] = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  }
  return mesh.userData[ORIGINAL_KEY] as Material[];
}

function disposeIfClone(material: Material, source: Material[]) {
  if (!source.includes(material)) {
    material.dispose();
  }
}

function asPhysical(source: Material) {
  if ('isMeshPhysicalMaterial' in source && source.isMeshPhysicalMaterial) {
    return (source as MeshPhysicalMaterial).clone();
  }

  const next = new MeshPhysicalMaterial();
  if (source instanceof MeshStandardMaterial) {
    next.name = source.name;
    next.color.copy(source.color);
    next.roughness = source.roughness;
    next.metalness = source.metalness;
    next.map = source.map;
    next.normalMap = source.normalMap;
    next.normalScale.copy(source.normalScale);
    next.roughnessMap = source.roughnessMap;
    next.metalnessMap = source.metalnessMap;
    next.aoMap = source.aoMap;
    next.aoMapIntensity = source.aoMapIntensity;
    next.emissive.copy(source.emissive);
    next.emissiveMap = source.emissiveMap;
    next.emissiveIntensity = source.emissiveIntensity;
    next.envMap = source.envMap;
    next.envMapIntensity = source.envMapIntensity;
    next.transparent = source.transparent;
    next.opacity = source.opacity;
    next.side = source.side;
    next.alphaMap = source.alphaMap;
    next.bumpMap = source.bumpMap;
    next.bumpScale = source.bumpScale;
  } else {
    next.name = source.name;
  }
  return next;
}

function toBodyMaterial(source: Material, paint: ThreePaint) {
  const next = new MeshPhysicalMaterial({
    name: source.name,
    color: paint.body,
    metalness: paint.metalness,
    roughness: paint.roughness,
    clearcoat: paint.clearcoat,
    clearcoatRoughness: 0.08,
    vertexColors: false,
    side: source instanceof MeshStandardMaterial ? source.side : undefined,
  });
  next.needsUpdate = true;
  return next;
}

function toBumperMaterial(source: Material, paint: ThreePaint) {
  const next = asPhysical(source);
  next.color.set(paint.bumper);
  next.metalness = 0.22;
  next.roughness = 0.48;
  next.clearcoat = 0.35;
  next.clearcoatRoughness = 0.28;
  next.needsUpdate = true;
  return next;
}

export function applyThreePaint(root: Object3D, paint: ThreePaint) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) {
      return;
    }

    const source = originals(mesh);
    const current = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    // 도장 대상이 아닌 부품은 지금 입혀진 재질을 그대로 둔다. 원래 재질로 되돌리면 림 마감, 캘리퍼, 실내 색처럼 다른 효과가
    // 입혀 둔 색이 차체 색을 바꿀 때마다 지워진다(그 효과들은 자기 값이 바뀔 때만 다시 입힌다).
    const kept = new Set<Material>();
    const next = source.map((material, index) => {
      if (!material || !('color' in material)) {
        return current[index] ?? material;
      }

      const role = paintRole(mesh.name, material.name);
      if (role === 'body') {
        return toBodyMaterial(material, paint);
      }
      if (role === 'bumper') {
        return toBumperMaterial(material, paint);
      }
      const keep = current[index] ?? material;
      kept.add(keep);
      return keep;
    });

    for (const material of current) {
      if (!kept.has(material)) disposeIfClone(material, source);
    }

    mesh.material = Array.isArray(mesh.material) ? next : (next[0] ?? mesh.material);
  });
}

/** 도장을 걷어 내고 모델 원래의 머티리얼로 되돌린다. 도장으로 만든 복제 머티리얼은 해제한다. */
export function restoreThreePaint(root: Object3D) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    const source = mesh.isMesh
      ? (mesh.userData[ORIGINAL_KEY] as Material[] | undefined)
      : undefined;
    if (!source) {
      return;
    }
    const current = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    // 도장 대상이 아닌 부품의 재질(림 마감, 캘리퍼, 실내 색)은 그대로 둔다. 도장을 걷어 내도 그 효과의 색은 남아야 한다.
    const kept = new Set<Material>();
    const next = source.map((material, index) => {
      if (material && 'color' in material && paintRole(mesh.name, material.name) === 'skip') {
        const keep = current[index] ?? material;
        kept.add(keep);
        return keep;
      }
      return material;
    });
    for (const material of current) {
      if (!kept.has(material)) disposeIfClone(material, source);
    }
    mesh.material = Array.isArray(mesh.material) ? next : (next[0] ?? mesh.material);
  });
}

export function enableThreeShadows(root: Object3D) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) {
      return;
    }
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
}
