"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { softDeleteMember, restoreMember, resetMemberPassword, hardDeleteMember } from "@/lib/actions/member";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  memberId: string;
  userId: string | null;
  isDeleted: boolean;
  hasAccount: boolean;
  passwordChangedAt: string | null;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function MemberDangerTab({ memberId, userId, isDeleted, hasAccount, passwordChangedAt }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  function handleDelete() {
    if (!confirm("Yakin ingin mengarsipkan anggota ini? Data tidak akan dihapus permanen.")) return;
    startTransition(async () => {
      const result = await softDeleteMember(memberId);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Anggota berhasil diarsipkan");
      router.push("/a/member");
    });
  }

  function handleRestore() {
    startTransition(async () => {
      const result = await restoreMember(memberId);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Anggota berhasil dipulihkan");
      router.refresh();
    });
  }

  function handleResetPassword() {
    if (!userId) return;
    if (newPassword.length < 8) { toast.error("Password minimal 8 karakter"); return; }
    startTransition(async () => {
      const result = await resetMemberPassword(memberId, userId, newPassword);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Password berhasil diubah");
      setNewPassword("");
      router.refresh();
    });
  }

  function handleHardDelete() {
    if (deleteConfirm !== "HAPUS") return;
    startTransition(async () => {
      const result = await hardDeleteMember(memberId);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Anggota berhasil dihapus permanen");
      router.push("/a/member");
    });
  }

  return (
    <div className="space-y-4">
      {/* Reset Password */}
      {hasAccount && userId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Reset Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {passwordChangedAt && (
              <p className="text-xs text-muted-foreground">
                Terakhir diubah: {formatDateTime(passwordChangedAt)}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Langsung ganti password anggota tanpa perlu konfirmasi email.
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1 max-w-xs">
                <Label htmlFor="new-password" className="sr-only">Password Baru</Label>
                <Input
                  id="new-password"
                  type={showPass ? "text" : "password"}
                  placeholder="Password baru (min. 8 karakter)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetPassword}
                disabled={isPending || newPassword.length < 8}
              >
                {isPending ? "Memproses..." : "Simpan Password"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Archive / Restore */}
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
              <Button size="sm" onClick={handleRestore} disabled={isPending}>
                {isPending ? "Memproses..." : "Pulihkan Anggota"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Anggota tidak akan dihapus permanen — hanya diarsipkan dan tidak dapat login.
              </p>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isPending}>
                {isPending ? "Memproses..." : "Arsipkan Anggota"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Hard Delete */}
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
