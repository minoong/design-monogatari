import { Skeleton, SkeletonGroup } from '@repo/ui/skeleton';

export default function SkeletonOptionRows() {
  return (
    <SkeletonGroup label="옵션을 불러오는 중입니다" className="flex w-full max-w-sm flex-col gap-2">
      {[0, 1, 2].map((index) => (
        <div key={index} className="border-border flex items-start gap-3 rounded-lg border p-4">
          <Skeleton className="mt-0.5 size-5 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </SkeletonGroup>
  );
}
