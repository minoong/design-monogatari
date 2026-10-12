import { Button } from '@repo/ui/button';
import { ArrowRightIcon } from '@repo/ui/icons/arrow-right';
import { PlusIcon } from '@repo/ui/icons/plus';

export default function ButtonWithIcon() {
  return (
    <>
      <Button variant="secondary">
        <PlusIcon data-icon="inline-start" />
        추가
      </Button>
      <Button variant="primary">
        다음
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </>
  );
}
