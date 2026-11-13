import Image from "next/image";
import { ArrowUpRight, GitFork, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RepoCardModel } from "@/lib/types";

function scoreClass(score: number): string {
  if (score >= 75) return "text-ember";
  if (score >= 50) return "text-pine";
  return "text-muted-foreground";
}

export function RepoCard({ repo }: { repo: RepoCardModel }) {
  const initial = repo.ownerLogin.slice(0, 1).toUpperCase();

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-card p-5 shadow-[0_16px_40px_-30px_rgba(36,48,40,0.5)]",
        repo.score >= 75 ? "border-ember/40" : "border-border",
      )}
    >
      <div className="flex items-start gap-3">
        {repo.avatarUrl ? (
          <Image
            src={repo.avatarUrl}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full border border-border object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted font-heading text-sm">
            {initial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-muted-foreground">
            <a href={repo.ownerUrl} className="hover:text-foreground hover:underline">
              {repo.ownerLogin}
            </a>
          </p>
          <h3 className="truncate font-heading text-xl leading-tight tracking-tight">
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pine"
            >
              {repo.name}
            </a>
          </h3>
        </div>
        <div className="text-right">
          <p
            className={cn("font-heading text-3xl leading-none tabular-nums", scoreClass(repo.score))}
            aria-label={`Watch score ${repo.score} out of 100`}
          >
            {repo.score}
          </p>
          <p className="mt-1 text-[10px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Watch
          </p>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 min-h-16 text-sm leading-relaxed text-muted-foreground">
        {repo.description ?? "No description provided."}
      </p>

      <ul className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-foreground/80">
        {repo.language ? (
          <li className="rounded-full bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
            {repo.language}
          </li>
        ) : null}
        <li
          className={cn(
            "rounded-full border px-2 py-0.5",
            repo.licenseLabel ? "border-border" : "border-ember/40 text-ember",
          )}
        >
          {repo.licenseLabel ?? "No license"}
        </li>
        <li className="inline-flex items-center gap-1">
          <Star className="size-3.5 text-gold" aria-hidden="true" />
          <span>{repo.starsLabel}</span>
          <span className="sr-only">stars</span>
        </li>
        <li className="inline-flex items-center gap-1">
          <GitFork className="size-3.5" aria-hidden="true" />
          <span>{repo.forks}</span>
          <span className="sr-only">forks</span>
        </li>
        <li>{repo.starsPerDayLabel}</li>
        <li>{repo.pushedLabel}</li>
      </ul>

      {repo.topics.length > 0 ? (
        <p className="mt-3 truncate text-xs text-muted-foreground">{repo.topics.join(" · ")}</p>
      ) : null}

      <div className="mt-4 rounded-xl bg-[oklch(0.96_0.012_85)] px-3 py-3">
        <p className="text-[11px] font-medium tracking-[0.14em] text-ember uppercase">Why watch</p>
        <p className="mt-1 text-sm leading-relaxed">{repo.reason}</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-x-3 gap-y-2.5 sm:grid-cols-6">
        {repo.factors.map((factor) => {
          const width = Math.max(0, Math.min(100, (factor.points / factor.max) * 100));
          return (
            <div key={factor.id}>
              <div className="flex items-baseline justify-between gap-1 text-[10px] tracking-wide text-muted-foreground uppercase">
                <span>{factor.short}</span>
                <span className="tabular-nums">{Math.round(factor.points)}</span>
              </div>
              <div
                className="mt-1 h-1 overflow-hidden rounded-full bg-muted"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={factor.max}
                aria-valuenow={Math.round(factor.points)}
                aria-label={`${factor.label}: ${factor.detail}`}
              >
                <div className="h-full rounded-full bg-pine" style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 pt-1">
        {repo.homepage && repo.homepageHost ? (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {repo.homepageHost}
          </a>
        ) : (
          <span className="text-xs text-muted-foreground">{repo.createdLabel}</span>
        )}
        <a
          href={repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
        >
          View on GitHub
          <ArrowUpRight />
        </a>
      </div>
    </article>
  );
}
