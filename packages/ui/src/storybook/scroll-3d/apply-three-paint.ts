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
};

export function threePaintFromSwatch(paint: PaintSwatch): ThreePaint {
  return {
    body: paint.hex,
    bumper: paint.bumperHex,
    metalness: paint.metalness,
    roughness: paint.roughness,
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
    clearcoat: 1,
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
      return material;
    });

    for (const material of current) {
      disposeIfClone(material, source);
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
