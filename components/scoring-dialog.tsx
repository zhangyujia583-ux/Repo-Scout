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
import { t } from "@/lib/copy";
import type { Locale } from "@/lib/locale";
import { SCORE_WEIGHTS } from "@/lib/score";

const ORDER = ["velocity", "recency", "activity", "docs", "license", "community"] as const;

export function ScoringDialog({ locale }: { locale: Locale }) {
  const copy = t(locale);

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
        <span className="sm:hidden">{copy.scoringShort}</span>
        <span className="hidden sm:inline">{copy.scoringLong}</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{copy.dialogTitle}</DialogTitle>
          <DialogDescription>{copy.dialogIntro}</DialogDescription>
        </DialogHeader>
        <ol className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
          {ORDER.map((id) => (
            <li key={id} className="grid grid-cols-[auto_1fr] gap-3">
              <span className="font-heading text-lg tabular-nums text-pine">{SCORE_WEIGHTS[id]}</span>
              <span>
                <span className="font-medium">{copy.factorLabels[id]}</span>
                <span className="mt-0.5 block text-muted-foreground">{copy.factors[id]}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground">{copy.dialogFoot}</p>
      </DialogContent>
    </Dialog>
  );
}
