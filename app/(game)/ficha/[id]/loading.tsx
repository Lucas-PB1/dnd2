import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function FichaDetailLoading() {
  return (
    <article aria-label="Carregando ficha">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-6 h-10 w-72" />

      <div className="editorial-card mt-6 rounded-lg p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index}>
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-5 w-44" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-dashed border-border-strong bg-surface/25 p-6">
        <Skeleton className="h-4 w-24" />
        <SkeletonText lines={2} className="mt-3 max-w-xl" />
      </div>
    </article>
  );
}
