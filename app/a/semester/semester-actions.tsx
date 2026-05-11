"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateSemesterStatus, deleteSemester } from "@/lib/actions/rapot";

interface Props {
  semesterId: string;
  currentStatus: "draft" | "active" | "closed";
}

export function SemesterActions({ semesterId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleStatus(status: "draft" | "active" | "closed") {
    startTransition(async () => {
      const res = await updateSemesterStatus(semesterId, status);
      if (res.error) toast.error(res.error);
      else toast.success("Status semester diperbarui.");
    });
  }

  function handleDelete() {
    if (!confirm("Hapus semester ini? Tindakan ini tidak bisa dibatalkan.")) return;
    startTransition(async () => {
      const res = await deleteSemester(semesterId);
      if (res.error) toast.error(res.error);
      else toast.success("Semester dihapus.");
    });
  }

  return (
    <div className="flex flex-wrap gap-2 shrink-0">
      {currentStatus === "draft" && (
        <>
          <Button size="sm" disabled={isPending} onClick={() => handleStatus("active")}>
            Aktifkan
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            disabled={isPending}
            onClick={handleDelete}
          >
            Hapus
          </Button>
        </>
      )}
      {currentStatus === "active" && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => handleStatus("closed")}
        >
          Tutup Semester
        </Button>
      )}
      {currentStatus === "closed" && (
        <span className="text-xs text-muted-foreground self-center">Selesai</span>
      )}
    </div>
  );
}
