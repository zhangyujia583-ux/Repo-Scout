import { discoverRepositories } from "@/lib/github";
import { parseFilters } from "@/lib/filters";
import { RepoBrowser } from "@/components/repo-browser";
import { EmptyState, ErrorState } from "@/components/status-panel";

export async function Results({
  searchParams,
}: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const filters = parseFilters(await searchParams);
  const result = await discoverRepositories(filters);

  if (!result.ok) return <ErrorState failure={result} />;
  if (result.repos.length === 0) return <EmptyState query={result.summary.query} />;
  return <RepoBrowser repos={result.repos} summary={result.summary} />;
}
