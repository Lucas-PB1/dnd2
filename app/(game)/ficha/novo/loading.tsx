import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function FichaNovoLoading() {
  return (
    <div aria-label="Carregando criador" className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border pb-3">
        <div>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-3 h-8 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-11 w-24" />
          <Skeleton className="h-11 w-28" />
        </div>
      </div>

      <div className="mt-4 grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_minmax(0,15rem)] lg:gap-6 xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,17rem)] xl:gap-8">
        <div className="editorial-card hidden rounded-lg p-4 lg:block">
          <SkeletonText lines={6} />
        </div>
        <div className="editorial-card rounded-lg p-5">
          <Skeleton className="h-6 w-36" />
          <SkeletonText lines={3} className="mt-4" />
          <div className="mt-5 grid grid-cols-2 gap-2.5 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-28" />
            ))}
          </div>
        </div>
        <div className="editorial-card hidden rounded-lg p-4 lg:block">
          <Skeleton className="h-7 w-36" />
          <SkeletonText lines={8} className="mt-4" />
        </div>
      </div>
    </div>
  );
}
