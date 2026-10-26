import { SwitchField } from '@repo/ui/switch-field';

export default function SwitchFieldPlain() {
  return (
    <div className="flex flex-col gap-2">
      <SwitchField label="견적 알림 받기" defaultChecked />
      <SwitchField disabled label="재고 알림 (준비 중)" />
    </div>
  );
}
