"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Mark } from "@/components/mark";
import { ScoringDialog } from "@/components/scoring-dialog";
import { buttonVariants } from "@/components/ui/button";
import { t } from "@/lib/copy";
import { htmlLang, parseLocale, SOURCE_REPO } from "@/lib/locale";
import { cn } from "@/lib/utils";

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.65 7.65 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const locale = parseLocale(params.get("lang"));
  const copy = t(locale);

  useEffect(() => {
    document.documentElement.lang = htmlLang(locale);
  }, [locale]);

  function setLocale(next: "en" | "zh") {
    const search = new URLSearchParams(params.toString());
    if (next === "en") search.delete("lang");
    else search.set("lang", "zh");
    const qs = search.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <header className="relative overflow-hidden bg-pine-deep text-[oklch(0.97_0.01_90)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, oklch(0.96 0.012 90 / 0.22) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-[oklch(0.62_0.14_42/0.28)] blur-3xl"
      />
      <a
        href="#results"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2 focus:text-foreground"
      >
        {copy.skip}
      </a>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pt-6 pb-16 sm:px-6 sm:pt-8">
        <div className="flex items-center justify-between gap-4">
          <Link href={locale === "zh" ? "/?lang=zh" : "/"} className="flex items-center gap-2.5 text-inherit">
            <Mark className="size-8 text-white" />
            <span className="font-heading text-lg tracking-tight">Repo Scout</span>
          </Link>
          <div className="flex items-center gap-2">
            <div
              role="group"
              aria-label={copy.languageLabel}
              className="inline-flex rounded-lg bg-white/10 p-0.5 text-xs font-medium"
            >
              {(
                [
                  ["en", "EN"],
                  ["zh", "中文"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={locale === value}
                  onClick={() => setLocale(value)}
                  className={`rounded-md px-2 py-1 transition-colors ${
                    locale === value ? "bg-white text-pine-deep" : "text-white/80 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <ScoringDialog locale={locale} />
            <a
              href={SOURCE_REPO}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={copy.source}
              className={cn(
                buttonVariants({ variant: "outline", size: "icon" }),
                "border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white",
              )}
            >
              <GitHubMark className="size-4" />
            </a>
          </div>
        </div>
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.18em] text-[oklch(0.86_0.04_85)] uppercase">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 max-w-xl font-heading text-[2.35rem] leading-[1.05] font-medium tracking-tight text-balance sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[oklch(0.92_0.02_90/0.82)] sm:text-lg">
            {copy.lede}
          </p>
        </div>
      </div>
    </header>
  );
}
