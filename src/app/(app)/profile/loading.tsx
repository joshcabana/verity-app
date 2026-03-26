import { Skeleton } from '@/components/Skeleton';

export default function ProfileLoading() {
  return (
    <div className="p-5 space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
