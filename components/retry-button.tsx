"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RetryButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <Button type="button" onClick={() => router.refresh()} className="w-fit">
      <RefreshCw />
      {label}
    </Button>
  );
}
