import { CopyButton } from '@repo/ui/copy-button';

export default function CopyButtonIconOnly() {
  return (
    <div className="flex items-center gap-3">
      <code className="text-sm">GCW95KC</code>
      <CopyButton iconOnly label="견적 코드 복사" size="small" value="GCW95KC" />
    </div>
  );
}
