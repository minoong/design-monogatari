import {
  DoubleSide,
  Group,
  type Material,
  type Mesh,
  MeshStandardMaterial,
  type Object3D,
} from 'three';

import {
  G05_WHEEL_POSES,
  isG05LightEffectName,
  isG05MirroredFile,
  isG05VoidName,
  isG05WheelsFile,
} from './g05-layout';

function enableDoubleSide(root: Object3D) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) {
      return;
    }
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      (material as Material).side = DoubleSide;
    }
  });
}

function hideUtilityMeshes(root: Object3D) {
  root.traverse((node) => {
    if (isG05LightEffectName(node.name) || isG05VoidName(node.name)) {
      node.visible = false;
    }
  });
}

function prepareG05Glass(root: Object3D) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) {
      return;
    }
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const material of materials) {
      if (!/glass/i.test(material.name)) {
        continue;
      }
      material.transparent = true;
      if (!/2sided_dark|print_dark|smoked/i.test(material.name)) {
        continue;
      }
      material.opacity = 0.38;
      if (material instanceof MeshStandardMaterial) {
        material.color.set('#1c242c');
        material.metalness = 0;
        material.roughness = 0.08;
      }
    }
  });
}

export function assembleG05Three(parts: Array<{ file: string; scene: Object3D }>) {
  const root = new Group();
  root.name = 'BMW_X5_G05';

  for (const { file, scene } of parts) {
    if (isG05WheelsFile(file)) {
      continue;
    }

    root.add(scene);

    if (isG05MirroredFile(file)) {
      const mirror = scene.clone(true);
      mirror.name = `${scene.name}_R`;
      mirror.scale.z *= -1;
      enableDoubleSide(mirror);
      root.add(mirror);
    }
  }

  const wheels = parts.find((part) => isG05WheelsFile(part.file))?.scene;
  if (wheels) {
    for (const pose of G05_WHEEL_POSES) {
      const instance = wheels.clone(true);
      instance.name = `Wheel_${pose.name}`;
      instance.position.set(pose.position[0], pose.position[1], pose.position[2]);
      instance.scale.set(pose.scale[0], pose.scale[1], pose.scale[2]);
      if (pose.scale[2] < 0) {
        enableDoubleSide(instance);
      }
      root.add(instance);
    }
  }

  hideUtilityMeshes(root);
  prepareG05Glass(root);
  return root;
}
