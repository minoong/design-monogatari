export default function TypographyScale() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <p className="text-title font-sans font-semibold tracking-tight">
        선택하신 구성의 견적을 확인하십시오
      </p>
      <p className="text-body font-sans">
        트림과 외장 색상, 옵션을 한 번 더 확인한 뒤 진행해 주십시오.
      </p>
      <p className="text-body font-sans font-semibold">탁송료는 지역에 따라 다릅니다.</p>
      <p className="text-muted-foreground text-caption font-sans">
        출고 일정은 재고에 따라 달라질 수 있습니다.
      </p>
      <p className="font-mono text-sm">bg-primary text-primary-foreground</p>
    </div>
  );
}
