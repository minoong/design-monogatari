'use client';

import MorphBasic from '@/_examples/morph/basic';
import PresenceBasic from '@/_examples/presence/basic';
import TextRollBasic from '@/_examples/text-roll/basic';

function DemoCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border bg-card flex min-w-0 flex-col rounded-xl border">
      <div className="min-h-44 flex-1 p-6">{children}</div>
      <div className="border-border border-t p-5">
        <h3 className="m-0 text-base font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-1.5 mb-0 text-sm leading-6">{description}</p>
      </div>
    </div>
  );
}

/** 움직임 데모. 문서 예시를 그대로 가져와 두 곳이 어긋나지 않는다. 모두 감소 모션 설정을 따른다. */
export function MotionSection() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <DemoCard
        description="조건에 따라 담기고 빠지는 컨트롤의 자리가 열리고 닫혀 이웃이 한꺼번에 밀리지 않습니다."
        title="등장 (Presence)"
      >
        <PresenceBasic />
      </DemoCard>
      <DemoCard
        description="같은 자리에서 알약이 안내 문구 크기로 변형되고 내용은 틀 안에서 밀려 바뀝니다."
        title="변형 (Morph)"
      >
        <MorphBasic />
      </DemoCard>
      <DemoCard
        description="단계 제목이 바뀔 때 글자가 위아래로 굴러 방향을 알립니다."
        title="글자 롤 (TextRoll)"
      >
        <TextRollBasic />
      </DemoCard>
    </div>
  );
}
