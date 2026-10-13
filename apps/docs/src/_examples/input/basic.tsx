import { Input } from '@repo/ui/input';

export default function InputBasic() {
  return (
    <Input aria-label="검색어" placeholder="모델명 또는 트림을 검색하십시오" className="max-w-sm" />
  );
}
