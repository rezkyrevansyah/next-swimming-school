"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveMember, rejectMember } from "@/lib/actions/member";

interface Props {
  memberId: string;
  branchId: string;
  memberPhone: string | null;
  memberName: string;
}

export function ApprovalActions({ memberId, branchId, memberPhone, memberName }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState("");
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const waPhone = memberPhone?.replace(/\D/g, "");

  function handleApprove() {
    startTransition(async () => {
      const res = await approveMember(memberId, {
        branchId,
        email: email.trim() || undefined,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        const msg = email.trim()
          ? `${memberName} disetujui. Password sementara: ${res.data?.tempPassword ?? "—"}`
          : `${memberName} berhasil disetujui.`;
        toast.success(msg);
      }
    });
  }

  function handleReject() {
    startTransition(async () => {
      const res = await rejectMember(memberId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Pendaftaran ${memberName} ditolak.`);
      }
    });
  }

  return (
    <div className="px-4 md:px-6 pb-4 border-t pt-4 space-y-3">
      {/* Email input toggle */}
      <button
        type="button"
        onClick={() => setShowEmailInput((v) => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {showEmailInput ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        {showEmailInput ? "Sembunyikan" : "Buat akun login"} (opsional)
      </button>

      {showEmailInput && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Email untuk akun login member
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.com"
            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <p className="text-xs text-muted-foreground">
            Kosongkan jika tidak perlu akun sekarang. Password sementara akan ditampilkan setelah disetujui.
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {/* WA button */}
        {memberPhone && (
          <a
            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Halo ${memberName}, terima kasih sudah mendaftar di Next Swimming School! Mohon kirimkan bukti pembayaran untuk konfirmasi keanggotaan Anda.`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              Minta Bukti Transfer
            </Button>
          </a>
        )}

        {/* Approve */}
        <Button
          size="sm"
          className="gap-2"
          disabled={isPending}
          onClick={handleApprove}
        >
          <CheckCircle2 className="h-4 w-4" />
          Setujui
        </Button>

        {/* Reject */}
        {!showRejectConfirm ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
            disabled={isPending}
            onClick={() => setShowRejectConfirm(true)}
          >
            <XCircle className="h-4 w-4" />
            Tolak
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Yakin tolak?</span>
            <Button
              variant="destructive"
              size="sm"
              disabled={isPending}
              onClick={handleReject}
            >
              Ya, Tolak
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRejectConfirm(false)}
            >
              Batal
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
