import { IconButton } from '@repo/ui/icon-button';
import { HeartIcon } from '@repo/ui/icons/heart';

export default function IconButtonSizes() {
  return (
    <>
      <IconButton aria-label="좋아요" size="small" variant="primary">
        <HeartIcon />
      </IconButton>
      <IconButton aria-label="좋아요" size="medium" variant="primary">
        <HeartIcon />
      </IconButton>
      <IconButton aria-label="좋아요" size="large" variant="primary">
        <HeartIcon />
      </IconButton>
      <IconButton aria-label="좋아요" size="xlarge" variant="primary">
        <HeartIcon />
      </IconButton>
    </>
  );
}
