"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { softDeleteMember, restoreMember, resetMemberPassword, hardDeleteMember } from "@/lib/actions/member";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Props {
  memberId: string;
  userId: string | null;
  isDeleted: boolean;
  hasAccount: boolean;
}

export function MemberDangerTab({ memberId, userId, isDeleted, hasAccount }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  function handleDelete() {
    if (!confirm("Yakin ingin mengarsipkan anggota ini? Data tidak akan dihapus permanen.")) return;
    startTransition(async () => {
      const result = await softDeleteMember(memberId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Anggota berhasil diarsipkan");
      router.push("/a/member");
    });
  }

  function handleRestore() {
    startTransition(async () => {
      const result = await restoreMember(memberId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Anggota berhasil dipulihkan");
      router.refresh();
    });
  }

  function handleResetPassword() {
    if (!userId) return;
    if (!confirm("Kata sandi lama akan diganti. Lanjutkan?")) return;
    startTransition(async () => {
      const result = await resetMemberPassword(userId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setTempPassword(result.data?.tempPassword ?? null);
      toast.success("Kata sandi berhasil direset");
    });
  }

  function handleHardDelete() {
    if (deleteConfirm !== "HAPUS") return;
    startTransition(async () => {
      const result = await hardDeleteMember(memberId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Anggota berhasil dihapus permanen");
      router.push("/a/member");
    });
  }

  return (
    <div className="space-y-4">
      {hasAccount && userId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Reset Kata Sandi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Buat kata sandi sementara baru untuk anggota ini. Informasikan kata sandi kepada anggota secara langsung.
            </p>
            {tempPassword && (
              <div className="rounded-md bg-muted px-4 py-3 font-mono text-sm">
                Kata sandi sementara:{" "}
                <span className="font-bold select-all">{tempPassword}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetPassword}
              disabled={isPending}
            >
              {isPending ? "Memproses..." : "Reset Kata Sandi"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-sm text-destructive">
            {isDeleted ? "Pulihkan Anggota" : "Arsipkan Anggota"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isDeleted ? (
            <>
              <p className="text-sm text-muted-foreground">
                Anggota ini sedang diarsipkan. Pulihkan untuk mengaktifkannya kembali.
              </p>
              <Button
                size="sm"
                onClick={handleRestore}
                disabled={isPending}
              >
                {isPending ? "Memproses..." : "Pulihkan Anggota"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Anggota tidak akan dihapus permanen — hanya diarsipkan dan tidak dapat login.
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? "Memproses..." : "Arsipkan Anggota"}
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
              Tindakan ini <strong>tidak dapat dibatalkan</strong>. Seluruh data anggota akan dihapus dari database secara permanen.
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
