export default function TypographyScale() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <p className="text-title font-sans font-semibold tracking-tight">이체할 금액을 확인할게요</p>
      <p className="text-body font-sans">
        보내는 계좌와 받는 분을 한 번 더 확인한 뒤 진행해 주세요.
      </p>
      <p className="text-body font-sans font-semibold">수수료는 없어요.</p>
      <p className="text-muted-foreground text-caption font-sans">
        영업일 기준 하루가 걸릴 수 있어요.
      </p>
      <p className="font-mono text-sm">bg-primary text-primary-foreground</p>
    </div>
  );
}
