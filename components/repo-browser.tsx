"use client";

import { useMemo, useState } from "react";
import { RepoCard } from "@/components/repo-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { t } from "@/lib/copy";
import type { Locale } from "@/lib/locale";
import { sortRepos, type SortKey } from "@/lib/sort";
import type { RepoCardModel, ResultsSummary } from "@/lib/types";

export function RepoBrowser({
  repos,
  summary,
  locale,
}: {
  repos: RepoCardModel[];
  summary: ResultsSummary;
  locale: Locale;
}) {
  const copy = t(locale);
  const sorts: { value: SortKey; label: string }[] = [
    { value: "score", label: copy.sorts.score },
    { value: "stars", label: copy.sorts.stars },
    { value: "velocity", label: copy.sorts.velocity },
    { value: "updated", label: copy.sorts.updated },
  ];
  const [sort, setSort] = useState<SortKey>("score");
  const sorted = useMemo(() => sortRepos(repos, sort), [repos, sort]);

  return (
    <section id="results" className="mt-8 scroll-mt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <h2 className="font-heading text-2xl tracking-tight sm:text-3xl">{summary.heading}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{summary.detail}</p>
        </div>
        <div className="w-full sm:w-48">
          <label htmlFor="sort" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            {copy.sort}
          </label>
          <Select
            value={sort}
            items={sorts}
            onValueChange={(value) => {
              if (value === "score" || value === "stars" || value === "velocity" || value === "updated") {
                setSort(value);
              }
            }}
          >
            <SelectTrigger id="sort" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sorts.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-1 text-xs leading-relaxed text-muted-foreground">
        <p>{summary.readmeNote}</p>
        <p>
          {summary.authNote}
          {summary.quotaNote ? ` ${summary.quotaNote}` : ""}
        </p>
        {summary.incompleteNote ? <p>{summary.incompleteNote}</p> : null}
      </div>

      <details className="mt-3 text-xs text-muted-foreground">
        <summary className="cursor-pointer font-medium text-foreground/80">{copy.querySummary}</summary>
        <p className="mt-2 font-mono text-[12px] leading-relaxed break-all">{summary.query}</p>
      </details>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {sorted.map((repo) => (
          <RepoCard key={repo.id || repo.fullName} repo={repo} locale={locale} />
        ))}
      </div>
    </section>
  );
}
