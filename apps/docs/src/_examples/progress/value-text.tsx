import { Progress } from '@repo/ui/progress';

export default function ProgressValueText() {
  return (
    <div className="w-full max-w-sm">
      <Progress label="차량 부품 불러오는 중" value={4} max={13} valueText="4 / 13 부품" />
    </div>
  );
}
