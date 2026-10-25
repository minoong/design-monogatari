import { Segmented, SegmentedItem } from '@repo/ui/segmented';

const INDICATORS = ['pill', 'underline', 'ring'] as const;

export default function SegmentedIndicators() {
  return (
    <div className="flex flex-col items-start gap-6">
      {INDICATORS.map((indicator) => (
        <div key={indicator} className="flex flex-col gap-2">
          <p className="text-muted-foreground text-caption">{indicator}</p>
          <Segmented
            aria-label={`보기 방식 (${indicator})`}
            defaultValue="exterior"
            indicator={indicator}
          >
            <SegmentedItem value="exterior">외관</SegmentedItem>
            <SegmentedItem value="interior">내장</SegmentedItem>
            <SegmentedItem value="wheel">휠</SegmentedItem>
          </Segmented>
        </div>
      ))}
    </div>
  );
}
