import { Checkbox } from '@repo/ui/checkbox';
import { Label } from '@repo/ui/label';

const STATES = [
  ['기본', {}],
  ['선택됨', { defaultChecked: true }],
  ['오류', { 'aria-invalid': true }],
  ['비활성', { disabled: true }],
  ['선택된 채 비활성', { disabled: true, defaultChecked: true }],
] as const;

export default function CheckboxStates() {
  return (
    <div className="flex flex-col gap-3">
      {STATES.map(([label, props], index) => (
        <div key={label} className="flex items-center gap-2">
          <Checkbox id={`checkbox-states-${index}`} {...props} />
          <Label htmlFor={`checkbox-states-${index}`}>{label}</Label>
        </div>
      ))}
    </div>
  );
}
