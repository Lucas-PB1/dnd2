import { Skeleton, SkeletonText } from "@/components/ui/Skeleton";

export default function FichaLoading() {
  return (
    <section aria-label="Carregando fichas">
      <Skeleton className="h-9 w-44" />
      <Skeleton className="mt-3 h-5 w-full max-w-xl" />
      <Skeleton className="mt-8 h-12 w-44" />

      <div className="mt-10 grid gap-5 sm:grid-cols-2 sm:gap-6">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="editorial-card rounded-lg p-5"
          >
            <Skeleton className="h-6 w-2/3" />
            <SkeletonText lines={3} className="mt-4" />
            <Skeleton className="mt-5 h-11 w-full" />
          </div>
        ))}
      </div>
    </section>
  );
}
