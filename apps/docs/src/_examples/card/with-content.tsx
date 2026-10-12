import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';

export default function CardWithContent() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>월 이체 한도</CardTitle>
          <Badge variant="secondary">대기 중</Badge>
        </div>
        <CardDescription>변경 요청은 영업일 기준 하루가 걸려요.</CardDescription>
      </CardHeader>
      <div className="flex justify-end px-6 pb-6">
        <Button variant="primary" size="medium">
          한도 변경
        </Button>
      </div>
    </Card>
  );
}
