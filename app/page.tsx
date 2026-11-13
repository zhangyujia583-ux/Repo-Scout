import { Suspense } from "react";
import type { Metadata } from "next";
import { FilterBar } from "@/components/filter-bar";
import { Results } from "@/components/results";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FilterBarFallback, HeaderFallback, ResultsFallback } from "@/components/skeletons";
import { t } from "@/lib/copy";
import { parseLocale } from "@/lib/locale";

export async function generateMetadata({ searchParams }: PageProps<"/">): Promise<Metadata> {
  const copy = t(parseLocale((await searchParams).lang));
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
  };
}

export default function Page({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex min-h-full flex-col">
      <Suspense fallback={<HeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-16 sm:px-6">
        <Suspense fallback={<FilterBarFallback />}>
          <FilterBar />
        </Suspense>
        <Suspense fallback={<ResultsFallback />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>
    </div>
  );
}
