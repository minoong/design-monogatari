import { Field, FieldLabel } from '@repo/ui/field';
import { Input } from '@repo/ui/input';

export default function FieldBasic() {
  return (
    <Field className="max-w-sm">
      <FieldLabel htmlFor="field-basic-name">이름</FieldLabel>
      <Input id="field-basic-name" placeholder="홍길동" />
    </Field>
  );
}
