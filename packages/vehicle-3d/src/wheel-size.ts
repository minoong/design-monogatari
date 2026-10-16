import { type BufferGeometry, Float32BufferAttribute, type Mesh, type Object3D } from 'three';

/**
 * 모델 휠의 림 바깥 반지름이 약 26.8cm(지름 약 21.1인치)라서 이 모델의 휠을 21인치로 본다.
 * 휠 크기를 바꿀 때는 림만 키우거나 줄이고, 타이어는 바깥 반지름(약 37.5cm)을 그대로 두고 안쪽 반지름만 옮긴다.
 * 실제 타이어도 휠이 커지면 옆면이 얇아지고 바깥 지름은 거의 같다.
 */
export const NATIVE_WHEEL_INCH = 21;

const NATIVE_POSITIONS = 'nativePositions';
const NATIVE_INNER = 'nativeInnerRadius';
const NATIVE_OUTER = 'nativeOuterRadius';
const BASE_SCALE = 'baseScale';

const TIRE = /wheel_tire/i;
const RIM = /wheel_rim/i;

/** 지오메트리 위치를 float 복사본으로 바꿔 두고, 원래 위치와 타이어의 안쪽·바깥 반지름을 기억한다. */
function nativeShape(geometry: BufferGeometry) {
  let native = geometry.userData[NATIVE_POSITIONS] as Float32Array | undefined;
  if (!native) {
    const position = geometry.getAttribute('position');
    native = new Float32Array(position.count * 3);
    let inner = Infinity;
    let outer = 0;
    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const y = position.getY(index);
      native[index * 3] = x;
      native[index * 3 + 1] = y;
      native[index * 3 + 2] = position.getZ(index);
      const radius = Math.hypot(x, y);
      inner = Math.min(inner, radius);
      outer = Math.max(outer, radius);
    }
    geometry.userData[NATIVE_POSITIONS] = native;
    geometry.userData[NATIVE_INNER] = inner;
    geometry.userData[NATIVE_OUTER] = outer;
    geometry.setAttribute('position', new Float32BufferAttribute(native.slice(), 3));
  }
  return {
    native,
    inner: geometry.userData[NATIVE_INNER] as number,
    outer: geometry.userData[NATIVE_OUTER] as number,
  };
}

/** 타이어의 안쪽 반지름을 `ratio`배로 옮기고, 바깥 반지름은 그대로 두며 그 사이를 비례해 늘이거나 줄인다. */
function reshapeTire(geometry: BufferGeometry, ratio: number) {
  const { native, inner, outer } = nativeShape(geometry);
  const target = geometry.getAttribute('position');
  const array = target.array as Float32Array;
  const innerNext = inner * ratio;
  const span = outer - inner;

  for (let index = 0; index < target.count; index += 1) {
    const x = native[index * 3] as number;
    const y = native[index * 3 + 1] as number;
    const radius = Math.hypot(x, y);
    if (radius < 1e-6 || span <= 0) {
      continue;
    }
    const along = (radius - inner) / span;
    const next = innerNext + along * (outer - innerNext);
    const factor = next / radius;
    array[index * 3] = x * factor;
    array[index * 3 + 1] = y * factor;
  }
  target.needsUpdate = true;
  geometry.computeBoundingSphere();
  geometry.computeBoundingBox();
}

/**
 * 휠 크기(인치)를 모델에 반영한다. 모델을 다시 불러오지 않고, 여러 번 불러도 원래 모양에서 다시 계산한다.
 * 림은 평면 방향으로만 크기를 바꾸고(폭은 그대로), 브레이크와 나사는 그대로 둔다.
 */
export function applyWheelSize(root: Object3D, inch: number) {
  const ratio = inch / NATIVE_WHEEL_INCH;
  const reshaped = new Set<BufferGeometry>();

  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) {
      return;
    }
    if (RIM.test(mesh.name)) {
      const base = (mesh.userData[BASE_SCALE] ??= mesh.scale.clone()) as typeof mesh.scale;
      mesh.scale.set(base.x * ratio, base.y * ratio, base.z);
      return;
    }
    if (TIRE.test(mesh.name) && !reshaped.has(mesh.geometry)) {
      reshaped.add(mesh.geometry);
      reshapeTire(mesh.geometry, ratio);
    }
  });
}
