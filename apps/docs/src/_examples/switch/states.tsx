import { Label } from '@repo/ui/label';
import { Switch } from '@repo/ui/switch';

export default function SwitchStates() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Switch id="switch-disabled-off" disabled />
        <Label htmlFor="switch-disabled-off" className="text-muted-foreground">
          재고 알림 (준비 중)
        </Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="switch-disabled-on" disabled defaultChecked />
        <Label htmlFor="switch-disabled-on" className="text-muted-foreground">
          기본 포함 옵션
        </Label>
      </div>
      <div className="flex items-center gap-3">
        <Switch id="switch-invalid" aria-invalid />
        <Label htmlFor="switch-invalid">약관 동의가 필요합니다</Label>
      </div>
    </div>
  );
}
