import { type Material, type Mesh, MeshPhysicalMaterial, type Object3D, type Texture } from 'three';

const MAP_KEYS = [
  'map',
  'normalMap',
  'roughnessMap',
  'metalnessMap',
  'aoMap',
  'emissiveMap',
  'envMap',
  'specularMap',
  'alphaMap',
  'bumpMap',
] as const;

function physical(name: string, params: ConstructorParameters<typeof MeshPhysicalMaterial>[0]) {
  return new MeshPhysicalMaterial({ name, ...params });
}

function disposeMaps(material: Material) {
  const record = material as Material &
    Record<(typeof MAP_KEYS)[number], Texture | null | undefined>;
  for (const key of MAP_KEYS) {
    const texture = record[key];
    if (texture && 'dispose' in texture) {
      texture.dispose();
      record[key] = null;
    }
  }
}

function rebuildMaterial(material: Material, meshName: string) {
  const name = `${material.name} ${meshName}`.toLowerCase();
  disposeMaps(material);
  const label = material.name;
  material.dispose();

  if (/glass|window|windshield|transparentplastic_na_clear|frosted/.test(name)) {
    const tinted = /tinted|frosted/.test(name);
    return physical(label, {
      color: tinted ? '#243038' : '#c5e1ee',
      metalness: 0,
      roughness: 0.06,
      transparent: true,
      opacity: tinted ? 0.42 : 0.28,
      envMapIntensity: 1.4,
    });
  }

  if (/chrome|metal_grained/.test(name)) {
    return physical(label, { color: '#c8cad0', metalness: 1, roughness: 0.22 });
  }

  if (/rubber|tire|tread/.test(name)) {
    return physical(label, { color: '#161616', metalness: 0, roughness: 0.92 });
  }

  if (/carpaint_solid|blackstone/.test(name)) {
    return physical(label, {
      color: '#1a1b1d',
      metalness: 0.45,
      roughness: 0.38,
      clearcoat: 0.8,
      clearcoatRoughness: 0.12,
    });
  }

  // Unity XC40 names the body `carpaint_metallic_729glaciersilver` but ships no albedo.
  if (/carpaint/.test(name) && !/plastic/.test(name)) {
    return physical(label, {
      color: '#c5c7cc',
      metalness: 0.86,
      roughness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });
  }

  if (/leather|carpet/.test(name) || (/charcoal/.test(name) && !/carpaint/.test(name))) {
    return physical(label, { color: '#2d2e32', metalness: 0, roughness: 0.68 });
  }

  if (/classicblack/.test(name)) {
    return physical(label, { color: '#141416', metalness: 0.08, roughness: 0.55 });
  }

  if (/white/.test(name)) {
    return physical(label, {
      color: '#f2f2f4',
      metalness: 0.04,
      roughness: /gloss/.test(name) ? 0.15 : 0.45,
    });
  }

  if (/red/.test(name) && /plastic|reflex|tail/.test(name)) {
    return physical(label, {
      color: '#8a1518',
      metalness: 0.2,
      roughness: 0.35,
      transparent: /reflex|transparent/.test(name),
      opacity: 0.7,
    });
  }

  return physical(label, { color: '#3a3b40', metalness: 0.05, roughness: 0.55 });
}

export function prepareFbxMaterials(root: Object3D) {
  root.traverse((node) => {
    const mesh = node as Mesh;
    if (!mesh.isMesh) {
      return;
    }

    mesh.geometry.deleteAttribute('color');
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const next = materials.map((material) => rebuildMaterial(material, mesh.name));
    mesh.material = Array.isArray(mesh.material) ? next : (next[0] ?? mesh.material);
  });
}
