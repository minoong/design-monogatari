import { Box3, type Mesh, type Object3D, Vector3 } from 'three';

export type VehicleFront = 'x+' | 'x-' | 'z+' | 'z-';

const FRONT =
  /hood|headlight|headlamp|\bfront\b|grille|bumper_f|door_f|doors_f|fender_f|wheelfront|wheel_fl|wheel_fr|wheel_f\b|lightstext/;
const REAR =
  /tailgate|taillight|trunk|boot|\brear\b|door_b|doors_b|door_r|exhaust|wheelrear|wheel_bl|wheel_br/;

export function alignVehicleHeading(root: Object3D, front?: VehicleFront) {
  if (front) {
    applyFront(root, front);
    root.updateWorldMatrix(true, true);
    return;
  }

  root.updateWorldMatrix(true, true);
  const vehicle = new Box3().setFromObject(root);
  const size = new Vector3();
  vehicle.getSize(size);

  if (size.x > size.z) {
    root.rotateY(Math.PI / 2);
    root.updateWorldMatrix(true, true);
    vehicle.setFromObject(root);
    vehicle.getSize(size);
  }

  const frontZ = namedCentroidZ(root, FRONT, size.z);
  const rearZ = namedCentroidZ(root, REAR, size.z);
  const roofZ = frontZ === null && rearZ === null ? roofCentroidZ(root, vehicle) : null;

  const shouldFlip =
    frontZ !== null && rearZ !== null
      ? frontZ < rearZ
      : frontZ !== null
        ? frontZ < 0
        : rearZ !== null
          ? rearZ > 0
          : roofZ !== null
            ? roofZ > 0
            : false;

  if (shouldFlip) {
    root.rotateY(Math.PI);
    root.updateWorldMatrix(true, true);
  }
}

function applyFront(root: Object3D, front: VehicleFront) {
  if (front === 'z-') {
    root.rotateY(Math.PI);
  }
  if (front === 'x+') {
    root.rotateY(-Math.PI / 2);
  }
  if (front === 'x-') {
    root.rotateY(Math.PI / 2);
  }
}

function namedCentroidZ(root: Object3D, pattern: RegExp, lengthZ: number) {
  const hit = new Box3();
  let hasHit = false;
  const box = new Box3();
  const center = new Vector3();
  let sum = 0;
  let count = 0;

  root.traverse((node) => {
    if (!pattern.test(node.name.toLowerCase())) {
      return;
    }
    box.setFromObject(node);
    if (box.isEmpty()) {
      return;
    }
    if (!hasHit) {
      hit.copy(box);
      hasHit = true;
    } else {
      hit.union(box);
    }
    box.getCenter(center);
    sum += center.z;
    count += 1;
  });

  if (!hasHit || count === 0) {
    return null;
  }

  const span = hit.max.z - hit.min.z;
  if (lengthZ > 0 && span / lengthZ > 0.55) {
    return null;
  }

  return sum / count;
}

function roofCentroidZ(root: Object3D, vehicle: Box3) {
  const midY = (vehicle.min.y + vehicle.max.y) * 0.55;
  const box = new Box3();
  const center = new Vector3();
  let sum = 0;
  let count = 0;

  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) {
      return;
    }
    box.setFromObject(mesh);
    if (box.isEmpty()) {
      return;
    }
    box.getCenter(center);
    if (center.y < midY) {
      return;
    }
    sum += center.z;
    count += 1;
  });

  return count > 0 ? sum / count : null;
}
