import { Mark } from "@/components/mark";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="flex items-center gap-2">
          <Mark className="size-5 text-pine" />
          <span>Live data from the GitHub Search API. Watch scores are Repo Scout’s, not GitHub’s.</span>
        </p>
        <p>MIT License</p>
      </div>
    </footer>
  );
}
