import { Input } from '@repo/ui/input';

export default function InputStates() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Input aria-label="기본" placeholder="기본" />
      <Input aria-label="값 있음" defaultValue="입력한 값" />
      <Input aria-label="오류" aria-invalid defaultValue="잘못된 값" />
      <Input aria-label="비활성" disabled placeholder="비활성" />
      <Input aria-label="비밀번호" type="password" defaultValue="secret" />
    </div>
  );
}
