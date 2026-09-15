export const HDR_URL = '/models/studio.hdr';
export const PIN_DISTANCE = 1.6;
export const YAW = Math.PI / 2;
/** Shared 3/4 rest pose for paint and OEM. Kit `front` is mesh axis, not a per-car camera angle. */
export const REST_YAW = -0.35;
export const GROUND_Y = -0.62;
export const STUDIO_CAMERA = { position: [4.6, 1.55, 5.4] as const, fov: 32 };

export function yawFromProgress(progress: number) {
  return REST_YAW + Math.min(1, Math.max(0, progress)) * YAW;
}
