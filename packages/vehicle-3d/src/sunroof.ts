import {
  BackSide,
  BufferGeometry,
  Float32BufferAttribute,
  FrontSide,
  type Material,
  Matrix3,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  Vector3,
} from 'three';

/**
 * 유리가 열릴 때 움직이는 거리(월드 좌표, 차 길이 약 4.2). 뒤로 밀면서 아래로 내려 뒤쪽 지붕 도장과 안감 사이로 들어가게 한다.
 * 처음에는 위로 0.03 올렸는데 그러면 유리가 도장 위에 얹혀 뒤쪽 지붕에 반투명 사각형이 비친다(열기 전과 RGB가 65 달랐다).
 * 아래로 0.04는 가장자리가 조금 보이고, 0.09에서 열기 전과 같아졌다(변화 0.6 이하). 더 내렸을 때는 시험하지 못했다.
 */
const SLIDE_WORLD = new Vector3(0, -0.09, -0.55);
/**
 * 막는 판을 가장자리마다 이만큼(월드 좌표) 키운다. 도장 구멍과의 틈은 약 0.011이었다. 너무 키우면 지붕 곡면을 뚫고 올라와
 * 바깥에서 보인다(안쪽 판을 0.12로 키웠더니 지붕 위에 어두운 파편이 솟았다). 안감 구멍은 유리보다 가로로 약 0.13 넓어서
 * 안에서 보면 가장자리 틈으로 하늘이 가늘게 보이지만, 이 방식으로는 더 키울 수 없다.
 */
const OUTER_MARGIN = 0.03;
const INNER_MARGIN = 0.03;
const SLIDE_KEY = 'sunroofSlide';

type SlideInfo = {
  glass: Mesh;
  base: Vector3;
  local: Vector3;
  /** 닫혀 있을 때 유리의 불투명도 */
  opacity: number;
  /** 연 정도(0 닫힘, 1 완전히 열림) */
  amount: number;
  /** 선루프가 있는 차인지(없으면 유리는 숨기고 막는 판을 보인다) */
  present: boolean;
};

/** 이 정도 이상 열리면 유리가 투명해지기 시작하고, 끝까지 열리면 숨는다. */
const FADE_FROM = 0.55;

const GLASS_NAME = /exterior_glass_2sided_dark/i;
const PAINT_MESH_NAME = /001_exterior_paint/i;
const OUTER_NAME = '001_Sunroof_paint';
/**
 * 이름에 `interior_color_common_general`이 들어가야 실내 색(`apply-three-interior`)이 안쪽 면을 지붕 안감과 같은 색으로
 * 칠한다. 그리고 바깥 면의 재질 이름이 도장과 같아서 차체 색 변경(`apply-three-paint`)도 따라간다.
 */
const INNER_NAME = '003_Sunroof_Interior_Color_common_general';

function findGlass(root: Object3D) {
  let glass: Mesh | undefined;
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (mesh.isMesh && GLASS_NAME.test(mesh.name)) glass = mesh;
  });
  return glass;
}

function findRoofPaint(root: Object3D) {
  let material: Material | undefined;
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!material && mesh.isMesh && PAINT_MESH_NAME.test(mesh.name)) {
      material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    }
  });
  return material;
}

/** 위를 보는 삼각형(유리판의 윗면)의 인덱스. 월드 좌표의 법선 방향으로 가른다. */
function splitByFacing(glass: Mesh) {
  const geometry = glass.geometry;
  const index = geometry.index;
  const normal = geometry.getAttribute('normal');
  const up: number[] = [];
  if (!index || !normal) return up;
  glass.updateWorldMatrix(true, false);
  const direction = new Vector3();
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);
    direction
      .set(
        normal.getX(a) + normal.getX(b) + normal.getX(c),
        normal.getY(a) + normal.getY(b) + normal.getY(c),
        normal.getZ(a) + normal.getZ(b) + normal.getZ(c),
      )
      .transformDirection(glass.matrixWorld);
    if (direction.y >= 0) up.push(a, b, c);
  }
  return up;
}

/**
 * 막는 판은 지붕 도장의 구멍보다 가로로 약 1cm 작아서, 그 틈으로 안쪽의 검은 부품과 안감이 비쳐 지붕에 검은 테두리가 보였다.
 * (그 부품을 숨기면 지붕 도장이 상한다.) 판을 이루는 조각(앞 유리와 뒤 고정 유리)마다 가장자리 쪽으로 `margin`만큼 키워
 * 도장 가장자리와 겹치게 하고, 두 조각 사이의 틈도 덮는다. 모델의 위치는 정점 양자화 때문에 한계값에 붙어 있어서,
 * 실수 위치로 바꿔 넣는다.
 */
function enlargedPositions(source: Mesh, indices: number[], margin: number) {
  const position = source.geometry.getAttribute('position');
  source.updateWorldMatrix(true, false);
  const toLocal = new Matrix4().copy(source.matrixWorld).invert();
  const world = new Float32Array(position.count * 3);
  const v = new Vector3();
  for (let i = 0; i < position.count; i++) {
    v.fromBufferAttribute(position, i).applyMatrix4(source.matrixWorld);
    world.set([v.x, v.y, v.z], i * 3);
  }

  // 꼭짓점을 공유하는 삼각형끼리 한 조각으로 묶는다.
  const parent = Array.from({ length: position.count }, (_, i) => i);
  const find = (i: number): number => {
    let root = i;
    while (parent[root] !== root) root = parent[root] ?? root;
    parent[i] = root;
    return root;
  };
  for (let t = 0; t < indices.length; t += 3) {
    const a = find(indices[t] ?? 0);
    parent[find(indices[t + 1] ?? 0)] = a;
    parent[find(indices[t + 2] ?? 0)] = a;
  }
  const groups = new Map<number, number[]>();
  for (const i of new Set(indices)) {
    const root = find(i);
    groups.set(root, [...(groups.get(root) ?? []), i]);
  }

  for (const members of groups.values()) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const i of members) {
      minX = Math.min(minX, world[i * 3] ?? 0);
      maxX = Math.max(maxX, world[i * 3] ?? 0);
      minZ = Math.min(minZ, world[i * 3 + 2] ?? 0);
      maxZ = Math.max(maxZ, world[i * 3 + 2] ?? 0);
    }
    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const scaleX = (maxX - minX + 2 * margin) / (maxX - minX || 1);
    const scaleZ = (maxZ - minZ + 2 * margin) / (maxZ - minZ || 1);
    for (const i of members) {
      world[i * 3] = centerX + ((world[i * 3] ?? 0) - centerX) * scaleX;
      world[i * 3 + 2] = centerZ + ((world[i * 3 + 2] ?? 0) - centerZ) * scaleZ;
    }
  }

  const local = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    v.set(world[i * 3] ?? 0, world[i * 3 + 1] ?? 0, world[i * 3 + 2] ?? 0).applyMatrix4(toLocal);
    local.set([v.x, v.y, v.z], i * 3);
  }
  return local;
}

function patchMesh(
  source: Mesh,
  indices: number[],
  material: Material,
  name: string,
  margin: number,
) {
  const geometry: BufferGeometry = source.geometry.clone();
  geometry.setIndex(indices);
  geometry.setAttribute(
    'position',
    new Float32BufferAttribute(enlargedPositions(source, indices, margin), 3),
  );
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.position.copy(source.position);
  mesh.quaternion.copy(source.quaternion);
  mesh.scale.copy(source.scale);
  mesh.visible = false;
  return mesh;
}

/**
 * 선루프가 없는 차를 위해 선루프 구멍을 막는 판 두 장을 만든다. 모델에는 선루프 전용 유리 한 장만 있고 지붕 도장과
 * 지붕 안감에는 그 모양의 구멍이 뚫려 있다. 그 유리의 삼각형을 복사해 윗면은 차체 도장으로, 뒷면(실내에서 보이는 쪽)은 안감색으로 칠한다.
 * 안쪽 판은 같은 삼각형의 뒷면이다. 만든 판은 숨겨 두고 `setSunroof`가 유리와 번갈아 보이게 한다. 모델당 한 번만 부른다.
 */
export function addSunroofPatch(root: Object3D) {
  const glass = findGlass(root);
  const paint = findRoofPaint(root);
  if (!glass || !paint || !glass.parent || root.getObjectByName(OUTER_NAME)) return;

  // 유리는 크기가 줄고 회전한 부모 밑에 있어서, 월드 방향의 이동량을 그 부모의 좌표로 바꿔 둔다.
  glass.parent.updateWorldMatrix(true, false);
  const inverse = new Matrix3().setFromMatrix4(
    new Matrix4().copy(glass.parent.matrixWorld).invert(),
  );
  const slide: SlideInfo = {
    glass,
    base: glass.position.clone(),
    local: SLIDE_WORLD.clone().applyMatrix3(inverse),
    opacity: (glass.material as Material).opacity,
    amount: 0,
    present: true,
  };
  root.userData[SLIDE_KEY] = slide;

  const up = splitByFacing(glass);
  // 조립 단계에서 모든 재질을 양면으로 바꿔 두므로, 바깥 판은 복제해서 앞면만 그리게 한다.
  const outerMaterial = paint.clone();
  outerMaterial.side = FrontSide;
  // 키운 판이 도장 가장자리와 겹치는 띠에서 판이 이기게 한다(같은 색이라 이음매 깜빡임을 막는다).
  outerMaterial.polygonOffset = true;
  outerMaterial.polygonOffsetFactor = -2;
  outerMaterial.polygonOffsetUnits = -2;
  // 안쪽 판은 같은 윗면 삼각형의 뒷면을 그린다. 뒷면은 법선이 뒤집혀 아래(실내)를 보는 면으로 조명을 받는다. 유리판의 아랫면
  // 삼각형(117개)을 쓰면 구멍 일부만 덮이고 조명 방향도 맞지 않아 시트가 크림이나 브라운일 때 안감과 달리 검게 보인다.
  const innerMaterial = new MeshStandardMaterial({
    color: '#0e0e0e',
    roughness: 0.68,
    metalness: 1,
    side: BackSide,
  });

  glass.parent.add(
    patchMesh(glass, up, outerMaterial, OUTER_NAME, OUTER_MARGIN),
    patchMesh(glass, up, innerMaterial, INNER_NAME, INNER_MARGIN),
  );
}

/**
 * 유리의 불투명도와 보임을 연 정도에 맞춘다. 유리를 뒤로 밀어 지붕 도장 밑으로 넣어도 안감과의 틈이 좁아서, 접힌 유리가
 * 안감 뒤쪽에 반투명하게 비쳤다(밝은 배경에서 눈에 띔). 그래서 거의 다 들어갔을 때 투명해지다가 끝에서 숨긴다.
 */
function applyGlass(slide: SlideInfo) {
  const fade = Math.min(1, Math.max(0, (slide.amount - FADE_FROM) / (1 - FADE_FROM)));
  (slide.glass.material as Material).opacity = slide.opacity * (1 - fade);
  slide.glass.visible = slide.present && fade < 1;
}

/** 선루프 유리를 보이거나, 그 자리를 막는 판을 보인다. `addSunroofPatch`를 먼저 불러야 한다. */
export function setSunroof(root: Object3D, present: boolean) {
  const slide = root.userData[SLIDE_KEY] as SlideInfo | undefined;
  if (slide) {
    slide.present = present;
    applyGlass(slide);
  }
  for (const name of [OUTER_NAME, INNER_NAME]) {
    const patch = root.getObjectByName(name);
    if (patch) patch.visible = !present;
  }
}

/**
 * 선루프 유리를 연 정도(0 닫힘, 1 완전히 열림)만큼 뒤로 밀고 아래로 내린다. 막는 판은 그대로다. `addSunroofPatch`를 먼저
 * 불러야 한다. 모델에 가리개가 없어서, 열면 안감의 구멍 테두리와 하늘이 그대로 보인다.
 */
export function slideSunroof(root: Object3D, amount: number) {
  const slide = root.userData[SLIDE_KEY] as SlideInfo | undefined;
  if (!slide) return;
  slide.amount = amount;
  slide.glass.position.copy(slide.base).addScaledVector(slide.local, amount);
  applyGlass(slide);
}
