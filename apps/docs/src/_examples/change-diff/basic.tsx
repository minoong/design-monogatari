import { ChangeDiff } from '@repo/ui/change-diff';

export default function ChangeDiffBasic() {
  return (
    <ChangeDiff
      className="w-full max-w-xl"
      rows={[
        { label: '휠', before: '20인치 알로이 휠', after: '19인치 기본 휠' },
        { label: '선택 품목', before: '스카이 라운지 루프', after: undefined },
        { label: '액세서리', before: undefined, after: '빌트인 블랙박스' },
      ]}
      summary="-2,800,000원"
    />
  );
}
