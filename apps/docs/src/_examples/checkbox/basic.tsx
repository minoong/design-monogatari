import { Checkbox } from '@repo/ui/checkbox';
import { Label } from '@repo/ui/label';

export default function CheckboxBasic() {
  return (
    <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
      <legend className="mb-3 p-0 text-sm font-semibold">액세서리</legend>
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-basic-mat" defaultChecked />
        <Label htmlFor="checkbox-basic-mat">프리미엄 플로어 매트</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="checkbox-basic-dashcam" />
        <Label htmlFor="checkbox-basic-dashcam">빌트인 블랙박스</Label>
      </div>
    </fieldset>
  );
}
