import { Card, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';

export default function CardBasic() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>이용 안내</CardTitle>
        <CardDescription>
          이체 한도와 수수료는 상품마다 달라요. 진행 전에 한 번 더 확인해 주세요.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
