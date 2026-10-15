import { Skeleton, SkeletonGroup } from '@repo/ui/skeleton';

export default function SkeletonBasic() {
  return (
    <SkeletonGroup label="견적을 불러오는 중입니다" className="flex w-80 flex-col gap-3">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </SkeletonGroup>
  );
}
