"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { softDeleteClass, restoreClass, hardDeleteClass } from "@/lib/actions/class";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Props {
  classId: string;
  isDeleted: boolean;
}

export function ClassDangerTab({ classId, isDeleted }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState("");

  function handleDelete() {
    if (!confirm("Yakin ingin mengarsipkan kelas ini?")) return;
    startTransition(async () => {
      const result = await softDeleteClass(classId);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Kelas berhasil diarsipkan");
      router.push("/a/kelas");
    });
  }

  function handleRestore() {
    startTransition(async () => {
      const result = await restoreClass(classId);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Kelas berhasil dipulihkan");
      router.refresh();
    });
  }

  function handleHardDelete() {
    if (deleteConfirm !== "HAPUS") return;
    startTransition(async () => {
      const result = await hardDeleteClass(classId);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Kelas berhasil dihapus permanen");
      router.push("/a/kelas");
    });
  }

  return (
    <div className="space-y-4">
      <Card className={isDeleted ? undefined : "border-destructive/40"}>
        <CardHeader>
          <CardTitle className="text-sm text-destructive">
            {isDeleted ? "Pulihkan Kelas" : "Arsipkan Kelas"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isDeleted ? (
            <>
              <p className="text-sm text-muted-foreground">
                Kelas ini sedang diarsipkan. Pulihkan untuk mengaktifkannya kembali.
              </p>
              <Button size="sm" onClick={handleRestore} disabled={isPending}>
                {isPending ? "Memproses..." : "Pulihkan Kelas"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Kelas tidak akan dihapus permanen — hanya diarsipkan.
              </p>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
                {isPending ? "Memproses..." : "Arsipkan Kelas"}
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
              Tindakan ini <strong>tidak dapat dibatalkan</strong>. Seluruh data kelas termasuk jadwal dan anggota akan dihapus dari database secara permanen.
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
