"use client";

import { useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toggleSuspiciousFlag } from "@/lib/actions/coach";

export function SuspiciousToggle({
  recordId,
  suspicious,
}: {
  recordId: string;
  suspicious: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      await toggleSuspiciousFlag(recordId, !suspicious);
    });
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={suspicious ? "Klik untuk tandai Normal" : "Klik untuk tandai Mencurigakan"}
      className="cursor-pointer"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : suspicious ? (
        <Badge variant="destructive" className="gap-1 hover:opacity-80 transition-opacity">
          <AlertTriangle className="h-3 w-3" />
          Mencurigakan
        </Badge>
      ) : (
        <Badge variant="default" className="hover:opacity-80 transition-opacity">
          Normal
        </Badge>
      )}
    </button>
  );
}
