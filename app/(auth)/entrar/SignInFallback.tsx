import { Skeleton } from "@/components/ui/Skeleton";

function SignInFallback() {
  return (
    <div className="editorial-surface mx-auto w-full rounded-lg p-8">
      <Skeleton className="mx-auto h-8 w-48" />
      <Skeleton className="mt-6 h-12" />
    </div>
  );
}

export { SignInFallback };
