'use client';

import { vehicleById, vehicleUrls } from '@repo/vehicle-3d/vehicles';
import { type InspectHandle, useModelAvailable, VehicleCanvas } from '@repo/vehicle-3d/viewer';
import { useCallback, useRef, useState } from 'react';

import {
  caliperSwatchOf,
  CATALOG,
  type ColorId,
  interiorSwatchOf,
  paintSwatchOf,
  rimFinishSwatchOf,
  WHEEL_INCH,
} from '@/_pages/estimate/index.model';
import {
  type CameraPose,
  exteriorStill,
  FRAME_SIZES,
  type FrameSize,
  interiorStill,
  poseAt,
  SEQUENCES,
  type ShotLook,
  STILL_EXTERIOR,
  STILL_INTERIOR,
} from '@/_pages/intro/model/frame-shots';

const VEHICLE = vehicleById('x5-web');
const SINK = 'http://localhost:3999/save';

interface Job {
  look: ShotLook;
  cabin: boolean;
  pose: CameraPose;
  size: FrameSize;
  /** `public/intro/` 아래 경로 */
  path: string;
}

/** 주소의 `only`(시퀀스 id 또는 `stills`, 쉼표로 여럿)와 `size`(lg|sm)로 일부만 그린다. 없으면 전부. */
function buildJobs(only: string[] | null, sizes: FrameSize[]): Job[] {
  const jobs: Job[] = [];
  for (const size of sizes) {
    for (const shot of SEQUENCES) {
      if (only && !only.includes(shot.id)) continue;
      for (let index = 0; index < shot.count; index += 1) {
        jobs.push({
          look: shot.look,
          cabin: shot.cabin,
          pose: poseAt(shot.path, shot.count === 1 ? 0 : index / (shot.count - 1)),
          size,
          path: `frames/${shot.id}/${size}/${String(index).padStart(4, '0')}.webp`,
        });
      }
    }
    // 정지 장면은 큰 크기만 만든다(next/image가 화면에 맞는 작은 크기를 만들어 준다).
    if (size !== 'lg' || (only && !only.includes('stills'))) continue;
    for (const color of CATALOG.color) {
      for (const wheel of CATALOG.wheel) {
        jobs.push({
          look: { color: color.id, wheel: wheel.id as ShotLook['wheel'], interior: 'black' },
          cabin: false,
          pose: STILL_EXTERIOR,
          size,
          path: exteriorStill(size, color.id, wheel.id).replace('/intro/', ''),
        });
      }
    }
    for (const interior of CATALOG.interior) {
      jobs.push({
        look: { color: 'white', wheel: 'w21', interior: interior.id },
        cabin: true,
        pose: STILL_INTERIOR,
        size,
        path: interiorStill(size, interior.id).replace('/intro/', ''),
      });
    }
  }
  return jobs;
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function sameLook(a: ShotLook, b: ShotLook) {
  return a.color === b.color && a.wheel === b.wheel && a.interior === b.interior;
}

/**
 * 프레임 추출기. 모델을 불러온 뒤 `저장 시작`을 누르면 목록대로 장면을 바꿔 가며 그리고, 로컬 수신기
 * (`scripts/intro-frames-sink.mjs`)로 보낸다. 진행 상황은 `data-status`에 적혀서 브라우저 자동화가 읽을 수 있다.
 */
export default function IntroFramesCapture() {
  const available = useModelAvailable(vehicleUrls(VEHICLE)[0] ?? '');
  const inspectRef = useRef<InspectHandle | null>(null);
  const [ready, setReady] = useState(false);
  const [look, setLook] = useState<ShotLook>({ color: 'white', wheel: 'w21', interior: 'black' });
  const [status, setStatus] = useState('모델을 불러오는 중입니다');
  const lookRef = useRef(look);

  const run = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const only = params.get('only')?.split(',') ?? null;
    const sizes = (params.get('size')?.split(',') ?? ['lg', 'sm']) as FrameSize[];
    const jobs = buildJobs(only, sizes);
    let done = 0;
    for (const job of jobs) {
      if (!sameLook(lookRef.current, job.look)) {
        lookRef.current = job.look;
        setLook(job.look);
        // 도장·휠 교체가 장면에 반영될 때까지 몇 프레임 기다린다.
        for (let wait = 0; wait < 20; wait += 1) await nextFrame();
      }
      const { width, height } = FRAME_SIZES[job.size];
      const blob = await inspectRef.current?.capture({
        width,
        height,
        background: null,
        camera: job.pose,
        cabin: job.cabin,
        environmentBackground: job.cabin,
        type: 'image/webp',
        quality: job.size === 'lg' ? 0.8 : 0.76,
      });
      if (!blob) {
        setStatus(`실패: ${job.path}`);
        return;
      }
      const response = await fetch(`${SINK}?path=${encodeURIComponent(job.path)}`, {
        method: 'POST',
        body: blob,
      });
      if (!response.ok) {
        setStatus(`저장 실패: ${job.path}`);
        return;
      }
      done += 1;
      setStatus(`저장 중 ${done}/${jobs.length}`);
    }
    setStatus(`완료 ${done}`);
  }, []);

  return (
    <main className="bg-background text-foreground flex min-h-dvh flex-col gap-4 p-6">
      <h1 className="text-title font-semibold">인트로 프레임 추출</h1>
      <p data-status={status} className="text-body">
        {status}
      </p>
      <button
        type="button"
        disabled={!ready}
        onClick={() => void run()}
        className="bg-primary text-primary-foreground w-fit rounded-md px-4 py-2 disabled:opacity-50"
      >
        저장 시작
      </button>
      <div className="aspect-video w-200 bg-black">
        {available ? (
          <VehicleCanvas
            available={available}
            className="size-full"
            inspectRef={inspectRef}
            caliper={caliperSwatchOf('standard')}
            interior={interiorSwatchOf(look.interior as never)}
            onReady={() => {
              setReady(true);
              setStatus('준비되었습니다');
            }}
            paint={paintSwatchOf(look.color as ColorId)}
            rimFinish={rimFinishSwatchOf('standard')}
            sunroof
            vehicleId="x5-web"
            wheelInch={WHEEL_INCH[look.wheel]}
            wheelZoom={false}
          />
        ) : null}
      </div>
    </main>
  );
}
