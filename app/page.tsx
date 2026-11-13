import { Suspense } from "react";
import { FilterBar } from "@/components/filter-bar";
import { Results } from "@/components/results";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FilterBarFallback, ResultsFallback } from "@/components/skeletons";

export default function Page({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-16 sm:px-6">
        <Suspense fallback={<FilterBarFallback />}>
          <FilterBar />
        </Suspense>
        <Suspense fallback={<ResultsFallback />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
