import { Badge } from '@repo/ui/badge';

export default function BadgeVariants() {
  return (
    <>
      <Badge variant="default">이체 완료</Badge>
      <Badge variant="secondary">대기 중</Badge>
      <Badge variant="destructive">한도 초과</Badge>
    </>
  );
}
