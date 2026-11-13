"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs font-medium tracking-[0.16em] text-ember uppercase">Repo Scout</p>
      <h1 className="mt-2 font-heading text-3xl tracking-tight">This page hit a snag</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        The discovery view failed before it could finish rendering. No repository list was filled
        in to cover the gap.
      </p>
      <Button className="mt-6 w-fit" onClick={() => reset()}>
        Try again
      </Button>
    </main>
  );
}
