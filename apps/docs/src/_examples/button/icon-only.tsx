import { Button } from '@repo/ui/button';
import { PlusIcon } from '@repo/ui/icons/plus';

export default function ButtonIconOnly() {
  return (
    <Button variant="primary" icon aria-label="추가">
      <PlusIcon />
    </Button>
  );
}
