import { IconButton } from '@repo/ui/icon-button';
import { HeartIcon } from '@repo/ui/icons/heart';

export default function IconButtonClear() {
  return (
    <IconButton aria-label="좋아요">
      <HeartIcon />
    </IconButton>
  );
}
