"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { softDeleteClass, restoreClass } from "@/lib/actions/class";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  classId: string;
  isDeleted: boolean;
}

export function ClassDangerTab({ classId, isDeleted }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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

  return (
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
  );
}
