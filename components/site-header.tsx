import Link from "next/link";
import { Mark } from "@/components/mark";
import { ScoringDialog } from "@/components/scoring-dialog";

export function SiteHeader() {
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
        Skip to results
      </a>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pt-6 pb-16 sm:px-6 sm:pt-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-inherit">
            <Mark className="size-8 text-white" />
            <span className="font-heading text-lg tracking-tight">Repo Scout</span>
          </Link>
          <ScoringDialog />
        </div>
        <div className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.18em] text-[oklch(0.86_0.04_85)] uppercase">
            Public GitHub · last 7, 30, or 90 days
          </p>
          <h1 className="mt-3 max-w-xl font-heading text-[2.35rem] leading-[1.05] font-medium tracking-tight text-balance sm:text-5xl">
            Find noteworthy new repositories before they are famous.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[oklch(0.92_0.02_90/0.82)] sm:text-lg">
            Search projects created recently, filter by language and topic, and read a short
            reason on every card. The watch score looks at star velocity, fresh pushes,
            documentation, and license — not the raw star total.
          </p>
        </div>
      </div>
    </header>
  );
}
