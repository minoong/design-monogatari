import { Field, FieldLabel } from '@repo/ui/field';
import { NativeSelect } from '@repo/ui/native-select';

export default function NativeSelectBasic() {
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="native-select-basic">탁송지</FieldLabel>
      <NativeSelect id="native-select-basic" defaultValue="seoul">
        <option value="seoul">서울</option>
        <option value="gyeonggi">경기</option>
        <option value="busan">부산</option>
        <option value="jeju">제주</option>
      </NativeSelect>
    </Field>
  );
}
