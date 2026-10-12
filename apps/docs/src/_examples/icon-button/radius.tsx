import { IconButton } from '@repo/ui/icon-button';
import { ArrowRightIcon } from '@repo/ui/icons/arrow-right';

export default function IconButtonRadius() {
  return (
    <>
      <IconButton aria-label="다음" radius="md" variant="primary">
        <ArrowRightIcon />
      </IconButton>
      <IconButton aria-label="다음" radius="lg" variant="primary">
        <ArrowRightIcon />
      </IconButton>
      <IconButton aria-label="다음" radius="pill" variant="primary">
        <ArrowRightIcon />
      </IconButton>
    </>
  );
}
