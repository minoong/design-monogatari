'use client';

import { Skeleton, SkeletonGroup } from '@repo/ui/skeleton';
import type { CameraViewId } from '@repo/vehicle-3d/views';
import { INSIDE_VIEW_NOTE_APPROX, isInsideView } from '@repo/vehicle-3d/views';
import dynamic from 'next/dynamic';
import { Component, type ReactNode, useCallback, useState } from 'react';

import { paintSwatchOf, type Selection } from '@/_pages/estimate/index.model';

const IntroViewer = dynamic(() => import('./intro-viewer'), {
  ssr: false,
  loading: () => <StageLoading />,
});

function StageLoading() {
  return (
    <SkeletonGroup label="차량 모델을 불러오는 중입니다" className="absolute inset-0">
      <Skeleton className="absolute inset-4 rounded-lg" />
    </SkeletonGroup>
  );
}

/** WebGL을 쓸 수 없거나 모델을 그리다 실패하면 이 안내와 색 견본이 대신 보인다. */
function StageFallback({ hex, label }: { hex: string; label: string }) {
  return (
    <div
      role="status"
      className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <span
        aria-hidden
        className="border-border size-16 rounded-full border"
        style={{ backgroundColor: hex }}
      />
      <p className="text-foreground text-sm font-medium">선택한 색: {label}</p>
      <p className="text-muted-foreground text-caption">
        이 환경에서는 3D 차량을 보여 드릴 수 없습니다. 선택과 가격은 그대로 확인할 수 있습니다.
      </p>
    </div>
  );
}

/** 3D를 그리다 실패하면 아무것도 그리지 않고 알린다. 대체 안내는 이 경계 밖에서 보인다. */
class ViewerBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * 인트로의 고정 차량 무대. 스크롤하는 글 옆(좁은 화면에서는 위)에 붙어 있고, 차량은 구역이 바뀔 때만 시점을 옮긴다
 * (`view`가 바뀌면 카메라가 1초쯤 부드럽게 이동한다). 스크롤 값이 카메라를 직접 움직이지는 않는다.
 * 이름(`role="img"`)은 캔버스에만 붙인다. 불러오는 중, 대체 안내, 실내 시점 안내는 그 밖에 있어야 스크린 리더가 읽는다.
 */
export function IntroStage({
  selection,
  view,
  label,
}: {
  selection: Selection;
  view: CameraViewId;
  /** 지금 사양을 말하는 차량의 이름 */
  label: string;
}) {
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onUnavailable = useCallback(() => setUnavailable(true), []);
  const paint = paintSwatchOf(selection.color);

  return (
    <div className="relative size-full">
      {unavailable ? (
        <StageFallback hex={paint.hex} label={paint.label} />
      ) : (
        <>
          <div role="img" aria-label={label} className="absolute inset-0">
            <ViewerBoundary onError={onUnavailable}>
              <IntroViewer
                selection={selection}
                view={view}
                onReady={onReady}
                onUnavailable={onUnavailable}
              />
            </ViewerBoundary>
          </div>
          {!ready ? <StageLoading /> : null}
        </>
      )}
      {isInsideView(view) && !unavailable ? (
        <p className="bg-background/85 text-muted-foreground text-caption absolute top-3 left-1/2 max-w-3xs -translate-x-1/2 rounded-md px-3 py-2 backdrop-blur-sm">
          {INSIDE_VIEW_NOTE_APPROX}
        </p>
      ) : null}
    </div>
  );
}
