import { IconButton } from '@repo/ui/icon-button';
import { PlusIcon } from '@repo/ui/icons/plus';

export default function IconButtonVariants() {
  return (
    <>
      <IconButton aria-label="추가" variant="clear">
        <PlusIcon />
      </IconButton>
      <IconButton aria-label="추가" variant="secondary">
        <PlusIcon />
      </IconButton>
      <IconButton aria-label="추가" variant="primary">
        <PlusIcon />
      </IconButton>
    </>
  );
}
