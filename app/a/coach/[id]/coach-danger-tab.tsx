"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { softDeleteCoach, restoreCoach, hardDeleteCoach, resetCoachPassword } from "@/lib/actions/coach";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  coachId: string;
  userId: string | null;
  isDeleted: boolean;
  passwordChangedAt: string | null;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function CoachDangerTab({ coachId, userId, isDeleted, passwordChangedAt }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
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

  function handleResetPassword() {
    if (!userId) return;
    if (newPassword.length < 8) { toast.error("Password minimal 8 karakter"); return; }
    startTransition(async () => {
      const result = await resetCoachPassword(coachId, userId, newPassword);
      if (result.error) { toast.error(result.error); return; }
      toast.success("Password berhasil diubah");
      setNewPassword("");
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
      {/* Reset Password */}
      {userId && (
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
              Langsung ganti password pelatih tanpa perlu konfirmasi email.
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

      {/* Hard Delete */}
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
