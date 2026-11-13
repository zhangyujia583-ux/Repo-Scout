import { Skeleton } from "@/components/ui/skeleton";

export function FilterBarFallback() {
  return (
    <div className="relative z-10 -mt-10 rounded-2xl border border-border bg-card p-5 shadow-[0_22px_50px_-32px_rgba(28,48,40,0.45)]">
      <Skeleton className="h-9 w-40" />
      <div className="mt-4 grid gap-3 md:grid-cols-12">
        <Skeleton className="h-14 md:col-span-5" />
        <Skeleton className="h-14 md:col-span-3" />
        <Skeleton className="h-14 md:col-span-2" />
        <Skeleton className="h-14 md:col-span-2" />
      </div>
    </div>
  );
}

export function ResultsFallback() {
  return (
    <div className="mt-8" aria-hidden="true">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-72 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
