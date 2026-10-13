import { Label } from '@repo/ui/label';
import { Radio } from '@repo/ui/radio';

export default function RadioStates() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Radio id="radio-states-default" name="radio-states-a" />
        <Label htmlFor="radio-states-default">기본</Label>
      </div>
      <div className="flex items-center gap-2">
        <Radio id="radio-states-checked" name="radio-states-b" defaultChecked />
        <Label htmlFor="radio-states-checked">선택됨</Label>
      </div>
      <div className="flex items-center gap-2">
        <Radio id="radio-states-invalid" name="radio-states-c" aria-invalid />
        <Label htmlFor="radio-states-invalid">오류</Label>
      </div>
      <div className="flex items-center gap-2">
        <Radio id="radio-states-disabled" name="radio-states-d" disabled />
        <Label htmlFor="radio-states-disabled">비활성</Label>
      </div>
      <div className="flex items-center gap-2">
        <Radio id="radio-states-disabled-checked" name="radio-states-e" disabled defaultChecked />
        <Label htmlFor="radio-states-disabled-checked">선택된 채 비활성</Label>
      </div>
    </div>
  );
}
