import {
  BackSide,
  BufferGeometry,
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

function patchMesh(source: Mesh, indices: number[], material: Material, name: string) {
  const geometry: BufferGeometry = source.geometry.clone();
  geometry.setIndex(indices);
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
  // 안쪽 판은 같은 윗면 삼각형의 뒷면을 그린다. 뒷면은 법선이 뒤집혀 아래(실내)를 보는 면으로 조명을 받는다. 유리판의 아랫면
  // 삼각형(117개)을 쓰면 구멍 일부만 덮이고 조명 방향도 맞지 않아 시트가 크림이나 브라운일 때 안감과 달리 검게 보인다.
  const innerMaterial = new MeshStandardMaterial({
    color: '#0e0e0e',
    roughness: 0.68,
    metalness: 1,
    side: BackSide,
  });

  glass.parent.add(
    patchMesh(glass, up, outerMaterial, OUTER_NAME),
    patchMesh(glass, up, innerMaterial, INNER_NAME),
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
