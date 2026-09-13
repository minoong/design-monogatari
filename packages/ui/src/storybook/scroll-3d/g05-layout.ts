export const G05_WHEEL_POSES = [
  { name: 'FL', position: [-6.309, 0.06922, 84.638] as const, scale: [1, 1, 1] as const },
  { name: 'FR', position: [-6.309, 0.06922, -84.638] as const, scale: [1, 1, -1] as const },
  { name: 'BL', position: [293.30399, 0.06922, 84.702] as const, scale: [1, 1, 1] as const },
  { name: 'BR', position: [293.30399, 0.06922, -84.702] as const, scale: [1, 1, -1] as const },
] as const;

export function isG05WheelsFile(file: string) {
  return file.includes('Wheels');
}

export function isG05DoorFile(file: string) {
  return file.includes('Doors_');
}

export function isG05HoodFile(file: string) {
  return /(?:^|\/)O_G05_Hood\.gltf$/.test(file);
}

export function isG05SeatsFile(file: string) {
  return /(?:^|\/)O_G05_Seats\.gltf$/.test(file);
}

export function isG05MirroredFile(file: string) {
  return isG05DoorFile(file) || isG05HoodFile(file) || isG05SeatsFile(file);
}

export function isG05LightEffectName(name: string) {
  return /lighteffect/i.test(name);
}

export function isG05VoidName(name: string) {
  return /_void$/i.test(name);
}
