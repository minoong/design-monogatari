import { Badge } from '@repo/ui/badge';
import { Button } from '@repo/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';

export default function CardWithContent() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>예상 견적가</CardTitle>
          <Badge variant="secondary">대기 중</Badge>
        </div>
        <CardDescription>
          구성을 바꾸시면 영업일 기준 하루 안에 상담원이 확인합니다.
        </CardDescription>
      </CardHeader>
      <div className="flex justify-end px-6 pb-6">
        <Button variant="primary" size="medium">
          구성 변경
        </Button>
      </div>
    </Card>
  );
}
