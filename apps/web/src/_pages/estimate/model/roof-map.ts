import type { PackageId } from './types';

/** 선루프(또는 그에 준하는 유리 지붕)를 담은 선택 품목. 이 중 하나라도 있으면 3D에 선루프를 보인다. */
export const SUNROOF_PACKAGES = ['panorama', 'sky-lounge'] as const satisfies readonly PackageId[];

export function hasSunroof(packages: readonly PackageId[]) {
  return SUNROOF_PACKAGES.some((id) => packages.includes(id));
}
