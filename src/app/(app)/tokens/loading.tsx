import { Skeleton, CardSkeleton } from '@/components/Skeleton';

export default function TokensLoading() {
  return (
    <div className="p-5 space-y-6">
      <Skeleton className="h-6 w-1/4" />
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid gap-3">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
