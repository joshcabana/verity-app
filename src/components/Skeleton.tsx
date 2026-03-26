export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-surface ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="border border-border rounded-xl p-5 space-y-3">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

export function PageSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="space-y-4 p-5">
      <Skeleton className="h-6 w-1/3 mb-6" />
      {Array.from({ length: cards }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
