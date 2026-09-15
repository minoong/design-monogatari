'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { Box3, Group, LoadingManager, type Object3D, Vector3 } from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { Loading } from '../../loading';
import { alignVehicleHeading, type VehicleFront } from './align-vehicle';
import { applyThreePaint, enableThreeShadows, threePaintFromSwatch } from './apply-three-paint';
import { assembleG05Three } from './assemble-g05-three';
import { GROUND_Y, STUDIO_CAMERA } from './constants';
import { InspectControls, type InspectHandle } from './inspect-controls';
import { InspectStage } from './inspect-stage';
import { SequenceOverlay } from './overlay';
import { type PaintSwatch, usePaintSelection } from './paints';
import { ScrollPinStage } from './pin-stage';
import { prepareFbxMaterials } from './prepare-fbx-materials';
import { ThreeStudio } from './three-studio';
import { ThreeYawGroup } from './three-yaw';
import { useModelAvailable } from './use-model-available';
import { vehicleById, type VehicleId, vehicleMissingHint, vehicleUrls } from './vehicles';

function sitOnGround(root: Object3D, groundY: number) {
  const box = new Box3().setFromObject(root);
  root.position.y += groundY - box.min.y;
}

function fitObject(root: Object3D, size = 4.2) {
  root.updateWorldMatrix(true, true);
  const box = new Box3().setFromObject(root);
  const dim = new Vector3();
  box.getSize(dim);
  const longest = Math.max(dim.x, dim.y, dim.z) || 1;
  root.scale.multiplyScalar(size / longest);
  const fitted = new Box3().setFromObject(root);
  const center = new Vector3();
  fitted.getCenter(center);
  root.position.sub(center);
  sitOnGround(root, GROUND_Y);
}

const EMPTY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

function rewriteFbxTextureUrl(url: string) {
  const normalized = url.replace(/\\/g, '/');
  if (/\.(fbx|glb|gltf)$/i.test(normalized)) {
    return url;
  }
  if (
    /\.(png|jpe?g|tga|tiff?|dds|exr|hdr)$/i.test(normalized) ||
    normalized.includes('ShaderFX') ||
    normalized.includes('volvocars.net')
  ) {
    return EMPTY_PNG;
  }
  return url;
}

function paintProgressFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      setTimeout(resolve, 0);
    });
  });
}

async function loadFbxWithProgress(
  file: string,
  manager: LoadingManager,
  report: (progress: number) => void,
  signal: AbortSignal,
) {
  const slash = file.lastIndexOf('/');
  const resourcePath = slash >= 0 ? `/models/${file.slice(0, slash + 1)}` : '/models/';
  const loader = new FBXLoader(manager);
  loader.manager.setURLModifier(rewriteFbxTextureUrl);
  loader.setResourcePath(resourcePath);

  const response = await fetch(`/models/${file}`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to load ${file}`);
  }

  const total = Number(response.headers.get('content-length')) || 0;
  const reader = response.body?.getReader();
  report(0);
  await paintProgressFrame();

  if (!reader) {
    const buffer = await response.arrayBuffer();
    report(1);
    await paintProgressFrame();
    return loader.parse(buffer, resourcePath);
  }

  const chunks: Uint8Array[] = [];
  let loaded = 0;
  let lastPercent = -1;
  let lastPaint = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
    loaded += value.byteLength;
    if (total > 0) {
      const progress = Math.min(1, loaded / total);
      const percent = Math.round(progress * 100);
      if (percent !== lastPercent) {
        lastPercent = percent;
        report(progress);
        const now = performance.now();
        if (now - lastPaint >= 80) {
          lastPaint = now;
          await paintProgressFrame();
        }
      }
    }
  }

  const bytes = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  report(1);
  await paintProgressFrame();
  return loader.parse(bytes.buffer, resourcePath);
}

const NOOP_PROGRESS = () => undefined;

function loadVehicleFile(
  file: string,
  manager: LoadingManager,
  report: (progress: number) => void = NOOP_PROGRESS,
  signal?: AbortSignal,
) {
  if (file.endsWith('.fbx')) {
    return loadFbxWithProgress(file, manager, report, signal ?? new AbortController().signal);
  }

  return new GLTFLoader(manager).loadAsync(`/models/${file}`).then((gltf) => gltf.scene);
}

function hideUtilityMeshes(root: Object3D) {
  root.traverse((node) => {
    const name = node.name.toLowerCase();
    if (name.includes('blobshadow') || name.includes('shadow_')) {
      node.visible = false;
    }
  });
}

function GltfModel({
  files,
  paint,
  front,
  oem = false,
  onProgress,
  onSettled,
}: {
  files: readonly string[];
  paint?: PaintSwatch;
  front?: VehicleFront;
  oem?: boolean;
  onProgress?: (progress: number) => void;
  onSettled?: () => void;
}) {
  const [model, setModel] = useState<Object3D | null>(null);
  const invalidate = useThree((state) => state.invalidate);
  const fileKey = files.join('|');
  const onProgressRef = useRef(onProgress);
  const onSettledRef = useRef(onSettled);

  useEffect(() => {
    onProgressRef.current = onProgress;
    onSettledRef.current = onSettled;
  });

  useEffect(() => {
    let cancelled = false;
    const abort = new AbortController();
    const manager = new LoadingManager();
    const useBytes = files.some((file) => file.endsWith('.fbx'));
    const report = (progress: number) => {
      if (!cancelled) {
        onProgressRef.current?.(progress);
      }
    };

    manager.onProgress = (_url, loaded, total) => {
      if (useBytes || total <= 0) {
        return;
      }
      report(loaded / total);
    };

    void Promise.all(
      files.map((file) =>
        loadVehicleFile(file, manager, useBytes ? report : NOOP_PROGRESS, abort.signal),
      ),
    )
      .then((gltfs) => {
        if (cancelled) {
          return;
        }
        const parts = files.flatMap((file, index) => {
          const scene = gltfs[index];
          return scene ? [{ file, scene }] : [];
        });
        const root = files.some((file) => file.startsWith('g05/'))
          ? assembleG05Three(parts)
          : (() => {
              const group = new Group();
              for (const { scene } of parts) {
                group.add(scene);
              }
              return group;
            })();
        hideUtilityMeshes(root);
        alignVehicleHeading(root, front);
        fitObject(root);
        if (files.some((file) => file.endsWith('.fbx'))) {
          prepareFbxMaterials(root);
        }
        enableThreeShadows(root);
        if (!oem && paint) {
          applyThreePaint(root, threePaintFromSwatch(paint));
        }
        setModel(root);
        invalidate();
        onSettledRef.current?.();
      })
      .catch(() => {
        if (!cancelled) {
          setModel(null);
          onSettledRef.current?.();
        }
      });

    return () => {
      cancelled = true;
      abort.abort();
    };
    // Paint is applied in a later effect so a color change does not reload the GLB.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on file set, heading, or inspect mode
  }, [fileKey, front, invalidate, oem]);

  useEffect(() => {
    if (!model || oem || !paint) {
      return;
    }
    applyThreePaint(model, threePaintFromSwatch(paint));
    invalidate();
  }, [invalidate, model, oem, paint]);

  if (!model) {
    return null;
  }

  return <primitive object={model} />;
}

export function ThreeGltfDemo({
  vehicleId: lockedId,
  oem = false,
}: {
  vehicleId?: VehicleId;
  oem?: boolean;
} = {}) {
  const progressRef = useRef(0);
  const [pickedId, setPickedId] = useState<VehicleId>(lockedId ?? 'x5');
  const vehicleId = lockedId ?? pickedId;
  const loadKey = `${vehicleId}:${oem}`;
  const vehicle = vehicleById(vehicleId);
  const urls = vehicleUrls(vehicle);
  const available = useModelAvailable(urls[0] ?? '');
  const { paintId, setPaintId, paint } = usePaintSelection();
  const inspectRef = useRef<InspectHandle | null>(null);
  const [loadSlot, setLoadSlot] = useState(loadKey);
  const [loadProgress, setLoadProgress] = useState<number | null>(null);
  const [modelReady, setModelReady] = useState(false);
  if (loadSlot !== loadKey) {
    setLoadSlot(loadKey);
    setLoadProgress(null);
    setModelReady(false);
  }

  const overlay = (
    <SequenceOverlay
      engine="Three.js"
      kind={vehicle.kind}
      oem={oem}
      paintId={oem ? undefined : paintId}
      vehicleId={vehicleId}
      onPaintId={oem ? undefined : setPaintId}
      onResetView={
        oem
          ? () => {
              inspectRef.current?.reset();
            }
          : undefined
      }
      onVehicleId={lockedId ? undefined : setPickedId}
      onZoomIn={
        oem
          ? () => {
              inspectRef.current?.zoomIn();
            }
          : undefined
      }
      onZoomOut={
        oem
          ? () => {
              inspectRef.current?.zoomOut();
            }
          : undefined
      }
    />
  );

  const canvas = (
    <Canvas
      aria-hidden
      className="absolute inset-0 size-full touch-none"
      camera={{ position: [...STUDIO_CAMERA.position], fov: STUDIO_CAMERA.fov }}
      gl={{ alpha: true, antialias: true }}
      shadows
    >
      <ThreeStudio />
      {oem ? <InspectControls handleRef={inspectRef} /> : null}
      <ThreeYawGroup progressRef={progressRef}>
        {available ? (
          <GltfModel
            key={`${vehicle.id}:${oem ? 'oem' : 'paint'}`}
            files={vehicle.files}
            front={vehicle.front}
            oem={oem}
            paint={oem ? undefined : paint}
            onProgress={setLoadProgress}
            onSettled={() => {
              setModelReady(true);
            }}
          />
        ) : null}
      </ThreeYawGroup>
    </Canvas>
  );

  const loading =
    available !== false && !modelReady ? (
      <motion.div
        key="model-loading"
        className="absolute inset-0 z-5 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.28 }}
      >
        <Loading
          label="모델을 불러오는 중"
          progress={loadProgress === null ? undefined : loadProgress}
          size="large"
        />
      </motion.div>
    ) : null;

  const missing =
    available === false ? (
      <p className="text-muted-foreground text-caption absolute inset-x-0 top-8 px-6">
        {vehicleMissingHint(vehicle) ?? (
          <>
            {vehicle.label} 모델이 없어요. <code>pnpm --filter @repo/ui copy:car</code>
          </>
        )}
      </p>
    ) : null;

  if (oem) {
    return (
      <InspectStage
        alt={`${vehicle.kind} 원본 모델입니다. 드래그하면 회전하고 스크롤하면 확대됩니다.`}
        overlay={overlay}
      >
        {missing}
        {canvas}
        <AnimatePresence>{loading}</AnimatePresence>
      </InspectStage>
    );
  }

  return (
    <ScrollPinStage
      alt={`${vehicle.kind} 모델이 스크롤에 따라 돌아갑니다.`}
      overlay={overlay}
      onProgress={(progress) => {
        progressRef.current = progress;
      }}
    >
      {missing}
      {canvas}
      <AnimatePresence>{loading}</AnimatePresence>
    </ScrollPinStage>
  );
}
