import { PriceBreakdown, PriceRow } from '@repo/ui/price-bar';

export default function PriceBarBreakdown() {
  return (
    <div className="border-border w-full max-w-md rounded-lg border p-4">
      <PriceBreakdown title="견적 요약">
        <PriceRow label="기본 가격" amount={82_900_000} />
        <PriceRow
          label="외장 색상 · 브루클린 그레이"
          amount={1_000_000}
          signed
          action={
            <a
              href="#exterior"
              aria-label="외장 색상 변경"
              className="text-foreground text-caption underline underline-offset-2"
            >
              변경
            </a>
          }
        />
        <PriceRow label="휠 · 19인치 기본 휠" amount="기본 포함" />
        <PriceRow label="프로모션" amount={-1_500_000} signed />
        <PriceRow label="예상 견적 금액" amount={82_400_000} total />
      </PriceBreakdown>
    </div>
  );
}
