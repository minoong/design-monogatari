const SKIP =
  /glass|tire|tread|interior|windshield|window|rim|brake|disc|license|floor|dash|engine|mechanical|signal|gasket|wiper|lens|emission|chrome|headlight|taillight/;

const SKIP_MAT = /^(mirror|mirror_mirror)/;

const BUMPER_MESH =
  /bumper|fascia|spoiler|splitter|diffuser|valence|apron|cladding|rocker|sill|underside|m_black|details_mat|m_details|exterior_plastic_grained|exterior_plastic_glossy|exterior_plastic_mat\b|exterior_aluminum_matte_black/;

const BUMPER_MAT = /blackstone|plastic_paint|m_black|details_mat/;

const BODY_MAT = /paint|carpaint|carrosserie|toycar/;

const BODY_MESH = /\bbody\b|bodywork/;

const TRIM_KEEP = /door|hood|mirror|headlight|taillight/;

export type PaintRole = 'body' | 'bumper' | 'skip';

export function paintRole(meshName: string, materialName: string): PaintRole {
  const mesh = meshName.toLowerCase();
  const mat = materialName.toLowerCase();
  const combined = `${mat} ${mesh}`;

  if (BODY_MAT.test(mat) && !/plastic/.test(mat) && !/blackstone/.test(mat)) {
    return 'body';
  }

  if (BUMPER_MESH.test(mesh)) {
    return 'bumper';
  }

  if (SKIP_MAT.test(mat) || SKIP.test(combined)) {
    return 'skip';
  }

  if (BODY_MESH.test(mesh) && !/plastic/.test(combined)) {
    return 'body';
  }

  if (BUMPER_MAT.test(mat) && !TRIM_KEEP.test(mesh)) {
    return 'bumper';
  }

  return 'skip';
}
