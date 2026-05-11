"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { softDeleteCoach, restoreCoach, hardDeleteCoach } from "@/lib/actions/coach";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Props {
  coachId: string;
  isDeleted: boolean;
}

export function CoachDangerTab({ coachId, isDeleted }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState("");

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

  function handleHardDelete() {
    if (deleteConfirm !== "HAPUS") return;
    startTransition(async () => {
      const result = await hardDeleteCoach(coachId);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Pelatih berhasil dihapus permanen");
      router.push("/a/coach");
    });
  }

  return (
    <div className="space-y-4">
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

      {isDeleted && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-sm text-destructive">Hapus Permanen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Tindakan ini <strong>tidak dapat dibatalkan</strong>. Seluruh data pelatih akan dihapus dari database secara permanen.
            </p>
            <p className="text-sm text-muted-foreground">
              Ketik <strong>HAPUS</strong> untuk mengonfirmasi.
            </p>
            <div className="flex gap-2">
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="HAPUS"
                className="max-w-[160px] font-mono"
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleHardDelete}
                disabled={isPending || deleteConfirm !== "HAPUS"}
              >
                {isPending ? "Menghapus..." : "Hapus Permanen"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
