'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { Box3, Group, type Object3D, Vector3 } from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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

function loadVehicleFile(file: string) {
  if (file.endsWith('.fbx')) {
    const loader = new FBXLoader();
    loader.manager.setURLModifier(rewriteFbxTextureUrl);
    const slash = file.lastIndexOf('/');
    if (slash >= 0) {
      loader.setResourcePath(`/models/${file.slice(0, slash + 1)}`);
    }
    return loader.loadAsync(`/models/${file}`);
  }

  return new GLTFLoader().loadAsync(`/models/${file}`).then((gltf) => gltf.scene);
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
}: {
  files: readonly string[];
  paint?: PaintSwatch;
  front?: VehicleFront;
  oem?: boolean;
}) {
  const [model, setModel] = useState<Object3D | null>(null);
  const invalidate = useThree((state) => state.invalidate);
  const fileKey = files.join('|');

  useEffect(() => {
    let cancelled = false;

    void Promise.all(files.map((file) => loadVehicleFile(file)))
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
      })
      .catch(() => {
        if (!cancelled) {
          setModel(null);
        }
      });

    return () => {
      cancelled = true;
    };
    // Paint is applied in a later effect so a color change does not reload the GLB.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per file set
  }, [fileKey, invalidate, oem]);

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
  const vehicle = vehicleById(vehicleId);
  const urls = vehicleUrls(vehicle);
  const available = useModelAvailable(urls[0] ?? '');
  const { paintId, setPaintId, paint } = usePaintSelection();
  const inspectRef = useRef<InspectHandle | null>(null);

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
      {oem ? (
        available ? (
          <GltfModel key={`${vehicle.id}:oem`} files={vehicle.files} front={vehicle.front} oem />
        ) : null
      ) : (
        <ThreeYawGroup progressRef={progressRef}>
          {available ? (
            <GltfModel
              key={`${vehicle.id}:paint`}
              files={vehicle.files}
              front={vehicle.front}
              paint={paint}
            />
          ) : null}
        </ThreeYawGroup>
      )}
    </Canvas>
  );

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
    </ScrollPinStage>
  );
}
