import { NativeSelect } from '@repo/ui/native-select';

export default function NativeSelectStates() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <NativeSelect aria-label="기본">
        <option>서울</option>
        <option>부산</option>
      </NativeSelect>
      <NativeSelect aria-label="오류" aria-invalid defaultValue="">
        <option value="" disabled>
          탁송지를 선택해 주십시오
        </option>
        <option value="seoul">서울</option>
      </NativeSelect>
      <NativeSelect aria-label="비활성" disabled>
        <option>서울</option>
      </NativeSelect>
    </div>
  );
}
