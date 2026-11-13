import { discoverRepositories } from "@/lib/github";
import { parseFilters } from "@/lib/filters";
import { parseLocale } from "@/lib/locale";
import { RepoBrowser } from "@/components/repo-browser";
import { EmptyState, ErrorState } from "@/components/status-panel";

export async function Results({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const locale = parseLocale(params.lang);
  const result = await discoverRepositories(filters, locale);

  if (!result.ok) return <ErrorState failure={result} locale={locale} />;
  if (result.repos.length === 0) return <EmptyState query={result.summary.query} locale={locale} />;
  return <RepoBrowser repos={result.repos} summary={result.summary} locale={locale} />;
}
