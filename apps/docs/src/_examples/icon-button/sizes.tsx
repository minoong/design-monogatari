import { IconButton } from '@repo/ui/icon-button';
import { HeartIcon } from '@repo/ui/icons/heart';

export default function IconButtonSizes() {
  return (
    <>
      <IconButton aria-label="관심 차량 담기" size="small" variant="primary">
        <HeartIcon />
      </IconButton>
      <IconButton aria-label="관심 차량 담기" size="medium" variant="primary">
        <HeartIcon />
      </IconButton>
      <IconButton aria-label="관심 차량 담기" size="large" variant="primary">
        <HeartIcon />
      </IconButton>
      <IconButton aria-label="관심 차량 담기" size="xlarge" variant="primary">
        <HeartIcon />
      </IconButton>
    </>
  );
}
