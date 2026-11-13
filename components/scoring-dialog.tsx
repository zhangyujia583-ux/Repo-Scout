"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SCORE_WEIGHTS } from "@/lib/score";

const FACTORS = [
  {
    label: "Star velocity",
    weight: SCORE_WEIGHTS.velocity,
    copy: "Stars divided by age, on a log scale. Forty stars a day saturates this factor, so a two-week-old project can outrank an older one with more total stars.",
  },
  {
    label: "Recency",
    weight: SCORE_WEIGHTS.recency,
    copy: "Newer repositories score higher. The first three days receive full marks; after six months this factor fades out.",
  },
  {
    label: "Recent activity",
    weight: SCORE_WEIGHTS.activity,
    copy: "Days since the last push. A push in the last day is full marks. A quiet quarter contributes almost nothing.",
  },
  {
    label: "Documentation",
    weight: SCORE_WEIGHTS.docs,
    copy: "Description, topics, homepage, and README length. README size is read only when a token is set. Without one, the other writing signals are scaled up so an unchecked README is not scored as a missing README.",
  },
  {
    label: "License",
    weight: SCORE_WEIGHTS.license,
    copy: "A permissive license scores highest, a copyleft license still scores well, and no license scores zero.",
  },
  {
    label: "Community",
    weight: SCORE_WEIGHTS.community,
    copy: "Forks, with a small bonus when people are forking as well as starring.",
  },
] as const;

export function ScoringDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          />
        }
      >
        <span className="sm:hidden">Scoring</span>
        <span className="hidden sm:inline">How scoring works</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">How the watch score works</DialogTitle>
          <DialogDescription>
            Repo Scout asks GitHub for the most-starred public repositories in your window, then
            re-ranks that page. The sentence on each card is written from the strongest signals.
            The bars show the full breakdown.
          </DialogDescription>
        </DialogHeader>
        <ol className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
          {FACTORS.map((factor) => (
            <li key={factor.label} className="grid grid-cols-[auto_1fr] gap-3">
              <span className="font-heading text-lg tabular-nums text-pine">{factor.weight}</span>
              <span>
                <span className="font-medium">{factor.label}</span>
                <span className="mt-0.5 block text-muted-foreground">{factor.copy}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground">
          Archived repositories are multiplied by 0.25. The score is a reading aid for public
          metadata, not a judgment of code quality. GitHub still chooses which repositories are on
          the page: the first 30 matches when sorted by stars.
        </p>
      </DialogContent>
    </Dialog>
  );
}
