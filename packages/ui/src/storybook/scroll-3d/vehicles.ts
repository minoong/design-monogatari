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

export const VEHICLES = [
  {
    id: 'x5',
    label: 'X5',
    files: X5_FILES,
    kind: 'BMW X5',
    front: 'x-', // kit mesh axis (+X rear). Studio view is REST_YAW, not a per-car camera.
    credit: {
      work: 'BMW X5 G05 (2018)',
      by: 'BMW Car IT',
      href: 'https://github.com/bmwcarit/digital-car-3d',
      license: 'CC BY 4.0',
      licenseHref: 'https://creativecommons.org/licenses/by/4.0/',
    },
  },
  {
    id: 'xc40',
    label: 'XC40',
    files: ['xc40/Models/XC40_Recharge_01_Mesh.fbx'] as const,
    kind: 'Volvo XC40 Recharge',
    front: 'x-', // kit mesh axis (+X rear), same as X5. Studio view is REST_YAW.
    credit: {
      work: 'Volvo XC40 Recharge',
      by: 'Volvo Cars / Unity Hub',
      href: 'https://developer.volvocars.com/3d/unity-template/',
      license: 'Volvo EULA (비상업)',
      licenseHref:
        'https://docs.unity3d.com/Packages/com.unity.template.test-track@1.0/license/Third%20Party%20Notices.html',
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
