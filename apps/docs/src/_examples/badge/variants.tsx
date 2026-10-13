import { Badge } from '@repo/ui/badge';

export default function BadgeVariants() {
  return (
    <>
      <Badge variant="default">견적 저장 완료</Badge>
      <Badge variant="secondary">상담 대기</Badge>
      <Badge variant="destructive">재고 없음</Badge>
    </>
  );
}
