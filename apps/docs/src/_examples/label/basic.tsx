import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';

export default function LabelBasic() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="label-basic-email">이메일</Label>
      <Input id="label-basic-email" type="email" placeholder="name@example.com" />
    </div>
  );
}
