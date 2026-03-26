import { Skeleton } from '@/components/Skeleton';

export default function LobbyLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <Skeleton className="w-24 h-24 rounded-full mx-auto" />
        <Skeleton className="h-5 w-48 mx-auto" />
        <Skeleton className="h-3 w-36 mx-auto" />
      </div>
    </div>
  );
}
