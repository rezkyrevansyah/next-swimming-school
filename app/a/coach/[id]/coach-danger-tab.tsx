"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { softDeleteCoach, restoreCoach } from "@/lib/actions/coach";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  coachId: string;
  isDeleted: boolean;
}

export function CoachDangerTab({ coachId, isDeleted }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm("Yakin ingin mengarsipkan pelatih ini?")) return;
    startTransition(async () => {
      const result = await softDeleteCoach(coachId);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Pelatih berhasil diarsipkan");
      router.push("/a/coach");
    });
  }

  function handleRestore() {
    startTransition(async () => {
      const result = await restoreCoach(coachId);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Pelatih berhasil dipulihkan");
      router.refresh();
    });
  }

  return (
    <Card className={isDeleted ? undefined : "border-destructive/40"}>
      <CardHeader>
        <CardTitle className="text-sm text-destructive">
          {isDeleted ? "Pulihkan Pelatih" : "Arsipkan Pelatih"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isDeleted ? (
          <>
            <p className="text-sm text-muted-foreground">
              Pelatih ini sedang diarsipkan. Pulihkan untuk mengaktifkannya kembali.
            </p>
            <Button size="sm" onClick={handleRestore} disabled={isPending}>
              {isPending ? "Memproses..." : "Pulihkan Pelatih"}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Pelatih tidak akan dihapus permanen — hanya diarsipkan.
            </p>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Memproses..." : "Arsipkan Pelatih"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
