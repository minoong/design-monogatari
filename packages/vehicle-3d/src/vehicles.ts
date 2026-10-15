export const X5_FILES = [
  'g05/O_G05_Exterior_Paint.gltf',
  'g05/O_G05_Exterior_non-Paint.gltf',
  'g05/O_G05_Hood.gltf',
  'g05/O_G05_Headlights.gltf',
  'g05/O_G05_Taillights.gltf',
  'g05/O_G05_Doors_F.gltf',
  'g05/O_G05_Doors_B.gltf',
  'g05/O_G05_Tailgate.gltf',
  'g05/O_G05_Wheels.gltf',
  'g05/O_G05_Emblem.gltf',
  'g05/O_G05_Interior_Color.gltf',
  'g05/O_G05_Interior_non-Color.gltf',
  'g05/O_G05_Seats.gltf',
  'g05/O_G05_SteeringWheel.gltf',
] as const;

/**
 * 웹에 서빙하는 최적화본. 같은 부품을 .glb(EXT_meshopt_compression + 양자화)로 바꿨고 엠블럼 부품은 뺐다
 * (`pnpm --filter @repo/vehicle-3d optimize:g05`).
 */
export const X5_WEB_FILES = X5_FILES.filter((file) => !file.includes('Emblem')).map((file) =>
  file.replace(/^g05\//, 'g05-web/').replace(/\.gltf$/, '.glb'),
);

/**
 * CC BY 4.0 notices (Section 3(a)): creator, source URI, license + link, a pointer to the
 * warranty disclaimer, and an indication that the material was modified. Trademark rights are
 * not licensed (Section 2(b)(2)), so the trademark line is shown as well.
 */
export const VEHICLES = [
  {
    id: 'x5',
    label: 'X5',
    files: X5_FILES,
    kind: 'BMW X5',
    front: 'x-',
    credit: {
      work: 'BMW X5 G05 (2018)',
      by: 'BMW Car IT',
      href: 'https://github.com/bmwcarit/digital-car-3d',
      license: 'CC BY 4.0',
      licenseHref: 'https://creativecommons.org/licenses/by/4.0/',
      disclaimerHref: 'https://creativecommons.org/licenses/by/4.0/legalcode#s5',
      changes:
        '반쪽 메시(도어·후드·시트)를 Z축으로 미러링해 조립하고, *_void·라이트 이펙트 노드를 숨기고, 앞유리를 투과 처리하고, 크기·방향을 맞췄습니다. 도장 스토리에서는 도장 색도 바꿉니다.',
      trademark:
        'BMW, X5와 BMW 엠블럼은 BMW AG의 상표입니다. 이 프로젝트는 BMW와 제휴·후원 관계가 없으며, 상표권은 CC BY 4.0에 포함되지 않습니다.',
    },
  },
  {
    id: 'x5-web',
    label: 'X5 (웹용 최적화)',
    files: X5_WEB_FILES,
    kind: 'BMW X5',
    front: 'x-',
    credit: {
      work: 'BMW X5 G05 (2018)',
      by: 'BMW Car IT',
      href: 'https://github.com/bmwcarit/digital-car-3d',
      license: 'CC BY 4.0',
      licenseHref: 'https://creativecommons.org/licenses/by/4.0/',
      disclaimerHref: 'https://creativecommons.org/licenses/by/4.0/legalcode#s5',
      changes:
        '반쪽 메시(도어·후드·시트)를 Z축으로 미러링해 조립하고, *_void·라이트 이펙트 노드를 숨기고, 앞유리를 투과 처리하고, 크기·방향을 맞췄습니다. 웹 배포를 위해 부품을 GLB로 바꾸고 미사용 데이터를 제거하고 정점을 양자화한 뒤 EXT_meshopt_compression으로 압축했으며, 엠블럼 부품은 뺐습니다. 도장 스토리에서는 도장 색도 바꿉니다.',
      trademark:
        'BMW, X5와 BMW 엠블럼은 BMW AG의 상표입니다. 이 프로젝트는 BMW와 제휴·후원 관계가 없으며, 상표권은 CC BY 4.0에 포함되지 않습니다.',
    },
  },
] as const;

export type VehicleId = (typeof VEHICLES)[number]['id'];

export function vehicleById(id: VehicleId) {
  return VEHICLES.find((vehicle) => vehicle.id === id) ?? VEHICLES[0];
}

export function vehicleUrls(vehicle: (typeof VEHICLES)[number]) {
  return vehicle.files.map((file) => `/models/${file}`);
}

export function vehicleMissingHint(vehicle: (typeof VEHICLES)[number]): string | undefined {
  if ('missingHint' in vehicle) {
    const hint = (vehicle as { missingHint?: string }).missingHint;
    return hint;
  }

  return undefined;
}
