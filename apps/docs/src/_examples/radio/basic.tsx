import { Label } from '@repo/ui/label';
import { Radio } from '@repo/ui/radio';

export default function RadioBasic() {
  return (
    <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
      <legend className="mb-3 p-0 text-sm font-semibold">과세 구분</legend>
      <div className="flex items-center gap-2">
        <Radio id="radio-basic-taxable" name="radio-basic-tax" value="taxable" defaultChecked />
        <Label htmlFor="radio-basic-taxable">과세</Label>
      </div>
      <div className="flex items-center gap-2">
        <Radio id="radio-basic-exempt" name="radio-basic-tax" value="exempt" />
        <Label htmlFor="radio-basic-exempt">면세</Label>
      </div>
    </fieldset>
  );
}
