"use client";

import { useSearchParams } from "next/navigation";
import { Mark } from "@/components/mark";
import { t } from "@/lib/copy";
import { parseLocale, SOURCE_REPO } from "@/lib/locale";

export function SiteFooter() {
  const params = useSearchParams();
  const copy = t(parseLocale(params.get("lang")));

  return (
    <footer className="mt-auto border-t border-border/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-center gap-2">
          <Mark className="size-5 shrink-0 text-pine" />
          <span>{copy.footer}</span>
        </p>
        <p className="flex items-center gap-3">
          <a href={SOURCE_REPO} className="hover:text-foreground hover:underline" target="_blank" rel="noopener noreferrer">
            {copy.source}
          </a>
          <span>{copy.licenseLine}</span>
        </p>
      </div>
    </footer>
  );
}
