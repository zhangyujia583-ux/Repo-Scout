"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/copy";
import { parseLocale } from "@/lib/locale";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useSearchParams();
  const copy = t(parseLocale(params.get("lang")));

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs font-medium tracking-[0.16em] text-ember uppercase">Repo Scout</p>
      <h1 className="mt-2 font-heading text-3xl tracking-tight">{copy.pageErrorTitle}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.pageErrorBody}</p>
      <Button className="mt-6 w-fit" onClick={() => reset()}>
        {copy.retry}
      </Button>
    </main>
  );
}
