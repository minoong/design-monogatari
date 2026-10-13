import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';

export default function LabelPeerDisabled() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Input id="label-peer-email" className="peer" disabled defaultValue="변경할 수 없습니다" />
      <Label htmlFor="label-peer-email">이메일 (비활성)</Label>
    </div>
  );
}
