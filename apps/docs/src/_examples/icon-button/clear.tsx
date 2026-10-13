import { IconButton } from '@repo/ui/icon-button';
import { HeartIcon } from '@repo/ui/icons/heart';

export default function IconButtonClear() {
  return (
    <IconButton aria-label="관심 차량 담기">
      <HeartIcon />
    </IconButton>
  );
}
