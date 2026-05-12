"use client";

import { useState, useTransition } from "react";
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updatePassword } from "@/lib/actions/auth";

export function ChangePasswordForm({ backHref }: { backHref: string }) {
  const [isPending, startTransition] = useTransition();
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const inputCls =
    "flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    if (newPw.length < 8) {
      setResult({ type: "error", message: "Password baru minimal 8 karakter." });
      return;
    }
    if (newPw !== confirm) {
      setResult({ type: "error", message: "Konfirmasi password tidak cocok." });
      return;
    }

    startTransition(async () => {
      const res = await updatePassword(newPw);
      if (res.error) {
        setResult({ type: "error", message: res.error });
      } else {
        setResult({ type: "success", message: "Password berhasil diubah." });
        setCurrent("");
        setNewPw("");
        setConfirm("");
      }
    });
  }

  if (result?.type === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-6 flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-8 w-8 text-green-600" />
        <div>
          <p className="font-semibold text-green-800">Password berhasil diubah!</p>
          <p className="text-sm text-green-700 mt-0.5">Gunakan password baru Anda untuk login berikutnya.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Lock className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-semibold text-sm">Ubah Password</h2>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Password Baru <span className="text-destructive">*</span></label>
          <div className="flex gap-2">
            <input
              type={showNew ? "text" : "password"}
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="h-9 w-9 rounded-md border border-input flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors shrink-0"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium">Konfirmasi Password Baru <span className="text-destructive">*</span></label>
          <div className="flex gap-2">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              placeholder="Ulangi password baru"
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="h-9 w-9 rounded-md border border-input flex items-center justify-center text-muted-foreground hover:bg-accent transition-colors shrink-0"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {confirm && newPw && confirm !== newPw && (
            <p className="text-xs text-destructive">Password tidak cocok.</p>
          )}
        </div>
      </div>

      {result?.type === "error" && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {result.message}
        </div>
      )}

      <Button type="submit" disabled={isPending || (!!confirm && newPw !== confirm)} className="w-full gap-2">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
        Ubah Password
      </Button>
    </form>
  );
}
