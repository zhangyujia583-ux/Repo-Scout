import { CircleX, SearchX } from "lucide-react";
import { RetryButton } from "@/components/retry-button";
import type { DiscoverFailure } from "@/lib/types";

export function EmptyState({ query }: { query: string }) {
  return (
    <section className="mt-8 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <SearchX className="mx-auto size-8 text-pine" aria-hidden="true" />
      <h2 className="mt-4 font-heading text-2xl tracking-tight">No repositories matched</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
        GitHub returned no public, non-fork repositories for this search. Widen the time window,
        clear the topic, or try a broader keyword. Repo Scout does not fill the gap with sample
        projects.
      </p>
      {query ? (
        <p className="mx-auto mt-4 max-w-xl font-mono text-xs break-all text-muted-foreground">
          {query}
        </p>
      ) : null}
    </section>
  );
}

export function ErrorState({ failure }: { failure: DiscoverFailure }) {
  const title =
    failure.error === "rate_limited"
      ? "GitHub rate limit reached"
      : failure.error === "invalid_token"
        ? "GitHub rejected the token"
        : failure.error === "network"
          ? "GitHub could not be reached"
          : "GitHub search failed";

  return (
    <section
      role="alert"
      className="mt-8 rounded-2xl border border-destructive/30 bg-card px-5 py-6 sm:px-6"
    >
      <div className="flex items-start gap-3">
        <CircleX className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="font-heading text-2xl tracking-tight">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {failure.message} The list stays empty rather than showing made-up repositories.
          </p>
        </div>
      </div>

      {failure.error === "rate_limited" || failure.error === "invalid_token" ? (
        <ol className="mt-5 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
          <li>Create a GitHub personal access token that can read public repositories.</li>
          <li>
            Copy <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.example</code> to{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.local</code>.
          </li>
          <li>
            Set <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">GITHUB_TOKEN</code> and
            restart the dev server. The token stays on the server and is never sent to the browser.
          </li>
        </ol>
      ) : null}

      {failure.resetLabel ? (
        <p className="mt-4 text-sm text-muted-foreground">
          The current limit window resets at {failure.resetLabel}.
        </p>
      ) : null}

      <div className="mt-5">
        <RetryButton />
      </div>
    </section>
  );
}
