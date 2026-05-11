"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";
import { setCoachStatus } from "@/lib/actions/coach";
import { Button } from "@/components/ui/button";

interface Props {
  coachId: string;
  currentStatus: string;
}

export function CoachStatusActions({ coachId, currentStatus }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleActivate() {
    startTransition(async () => {
      const result = await setCoachStatus(coachId, "active");
      if (result.error) { toast.error(result.error); return; }
      toast.success("Status pelatih diubah ke Aktif");
      router.refresh();
    });
  }

  if (currentStatus === "pending") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Pelatih belum aktif</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            Status masih <strong>Menunggu</strong>. Aktifkan agar pelatih bisa login dan menggunakan sistem.
          </p>
        </div>
        <Button size="sm" onClick={handleActivate} disabled={isPending} className="shrink-0">
          <CheckCircle className="h-4 w-4 mr-1.5" />
          {isPending ? "Memproses..." : "Aktifkan"}
        </Button>
      </div>
    );
  }

  if (currentStatus === "inactive") {
    return (
      <div className="rounded-xl border border-muted px-4 py-3 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">Pelatih tidak aktif.</p>
        <Button size="sm" variant="outline" onClick={handleActivate} disabled={isPending} className="shrink-0">
          {isPending ? "Memproses..." : "Aktifkan Kembali"}
        </Button>
      </div>
    );
  }

  return null;
}
