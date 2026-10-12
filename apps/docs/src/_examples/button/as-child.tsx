import { Button } from '@repo/ui/button';

export default function ButtonAsChild() {
  return (
    <Button asChild variant="secondary">
      <a href="https://github.com/minoong/design-monogatari">저장소 보기</a>
    </Button>
  );
}
