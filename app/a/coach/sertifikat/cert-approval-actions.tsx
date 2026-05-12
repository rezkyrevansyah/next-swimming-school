"use client";

import { useState, useTransition } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approveCertificate, rejectCertificate } from "@/lib/actions/coach";

export function CertApprovalActions({ certId }: { certId: string }) {
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"approved" | "rejected" | null>(null);

  if (done) {
    return (
      <div className="border-t px-4 py-2.5 text-xs text-muted-foreground">
        ✓ {done === "approved" ? "Disetujui." : "Ditolak."}
      </div>
    );
  }

  return (
    <>
      {error && <div className="border-t px-4 py-2 text-xs text-destructive">{error}</div>}

      {showReject ? (
        <div className="border-t px-4 py-3 space-y-2">
          <textarea
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
            placeholder="Alasan penolakan (opsional)..."
            rows={2}
            className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const res = await rejectCertificate(certId, rejectNote);
                  if (res.error) setError(res.error);
                  else setDone("rejected");
                });
              }}
              className="gap-1.5"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
              Konfirmasi Tolak
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowReject(false)}>Batal</Button>
          </div>
        </div>
      ) : (
        <div className="border-t flex divide-x">
          <button
            onClick={() => setShowReject(true)}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Tolak
          </button>
          <button
            onClick={() => {
              startTransition(async () => {
                const res = await approveCertificate(certId);
                if (res.error) setError(res.error);
                else setDone("approved");
              });
            }}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Setujui
          </button>
        </div>
      )}
    </>
  );
}
