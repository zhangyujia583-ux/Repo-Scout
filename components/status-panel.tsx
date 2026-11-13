import { CircleX, SearchX } from "lucide-react";
import { RetryButton } from "@/components/retry-button";
import { t } from "@/lib/copy";
import type { Locale } from "@/lib/locale";
import type { DiscoverFailure } from "@/lib/types";

export function EmptyState({ query, locale }: { query: string; locale: Locale }) {
  const copy = t(locale);
  return (
    <section className="mt-8 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
      <SearchX className="mx-auto size-8 text-pine" aria-hidden="true" />
      <h2 className="mt-4 font-heading text-2xl tracking-tight">{copy.emptyTitle}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
        {copy.emptyBody}
      </p>
      {query ? (
        <p className="mx-auto mt-4 max-w-xl font-mono text-xs break-all text-muted-foreground">
          {query}
        </p>
      ) : null}
    </section>
  );
}

export function ErrorState({ failure, locale }: { failure: DiscoverFailure; locale: Locale }) {
  const copy = t(locale);
  const showSteps = failure.error === "rate_limited" || failure.error === "invalid_token";

  return (
    <section
      role="alert"
      className="mt-8 rounded-2xl border border-destructive/30 bg-card px-5 py-6 sm:px-6"
    >
      <div className="flex items-start gap-3">
        <CircleX className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="font-heading text-2xl tracking-tight">{copy.errorTitles[failure.error]}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {failure.message} {copy.errorHonest}
          </p>
        </div>
      </div>

      {showSteps ? (
        <ol className="mt-5 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
          <li>{copy.step1}</li>
          <li>
            {copy.step2Lead}{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.example</code>{" "}
            {copy.step2Mid}{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">.env.local</code>
            {copy.step2End}
          </li>
          <li>
            {copy.step3Lead}{" "}
            <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">GITHUB_TOKEN</code>{" "}
            {copy.step3Rest}
          </li>
        </ol>
      ) : null}

      {failure.resetLabel ? (
        <p className="mt-4 text-sm text-muted-foreground">{copy.resetAt(failure.resetLabel)}</p>
      ) : null}

      <div className="mt-5">
        <RetryButton label={copy.retry} />
      </div>
    </section>
  );
}
