import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function CampanhaDetailLoading() {
  return (
    <article aria-label="Carregando campanha">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-6 h-10 w-full max-w-lg" />
      <SkeletonText lines={2} className="mt-5 max-w-2xl" />

      <div className="editorial-card mt-10 rounded-lg p-6">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="mt-5 space-y-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      </div>
    </article>
  );
}
