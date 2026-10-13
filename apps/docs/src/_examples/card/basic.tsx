import { Card, CardDescription, CardHeader, CardTitle } from '@repo/ui/card';

export default function CardBasic() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>견적 안내</CardTitle>
        <CardDescription>
          취득세와 부대비용은 지역과 과세 구분에 따라 다릅니다. 계약 전에 한 번 더 확인해 주십시오.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
