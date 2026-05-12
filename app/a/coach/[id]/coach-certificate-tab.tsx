"use client";

import { useState, useTransition } from "react";
import { CheckCircle, Clock, XCircle, Award, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { approveCertificate, rejectCertificate } from "@/lib/actions/coach";

interface Certificate {
  id: string;
  name: string;
  photo_url: string | null;
  issued_year: number | null;
  valid_until: string | null;
  no_expiry: boolean;
  approval_status: string;
  approval_notes: string | null;
  approved_at: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  approved: { label: "Disetujui", variant: "default" },
  pending_approval: { label: "Menunggu", variant: "secondary" },
  rejected: { label: "Ditolak", variant: "destructive" },
};

export function CoachCertificateTab({ certs }: { certs: Certificate[] }) {
  if (certs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
        <Award className="h-8 w-8 opacity-30" />
        <p>Belum ada sertifikat yang diupload.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {certs.map((cert) => (
        <CertCard key={cert.id} cert={cert} />
      ))}
    </div>
  );
}

function CertCard({ cert }: { cert: Certificate }) {
  const [isPending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const cfg = STATUS_CONFIG[cert.approval_status] ?? STATUS_CONFIG.pending_approval;

  function handleApprove() {
    startTransition(async () => {
      const res = await approveCertificate(cert.id);
      if (res.error) setError(res.error);
      else setDone(true);
    });
  }

  function handleReject() {
    startTransition(async () => {
      const res = await rejectCertificate(cert.id, rejectNote);
      if (res.error) setError(res.error);
      else setDone(true);
    });
  }

  if (done) {
    return (
      <div className="rounded-xl border bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
        ✓ Status sertifikat diperbarui.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-start gap-4 p-4">
        {cert.photo_url ? (
          <a href={cert.photo_url} target="_blank" rel="noopener noreferrer">
            <img
              src={cert.photo_url}
              alt={cert.name}
              className="h-20 w-20 rounded-lg object-cover border shrink-0 hover:opacity-80 transition-opacity"
            />
          </a>
        ) : (
          <div className="h-20 w-20 rounded-lg border bg-muted flex items-center justify-center shrink-0">
            <Award className="h-8 w-8 text-muted-foreground opacity-40" />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium truncate">{cert.name}</p>
            <Badge variant={cfg.variant} className="shrink-0 text-xs">{cfg.label}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Tahun: {cert.issued_year ?? "—"}
            {cert.no_expiry
              ? " · Tidak ada batas berlaku"
              : cert.valid_until
              ? ` · Berlaku s.d. ${new Date(cert.valid_until).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`
              : ""}
          </p>
          {cert.approval_notes && (
            <p className="text-xs text-muted-foreground italic">{cert.approval_notes}</p>
          )}
          {cert.approved_at && (
            <p className="text-xs text-muted-foreground">
              {cert.approval_status === "approved" ? "Disetujui" : "Ditolak"}{" "}
              {new Date(cert.approved_at).toLocaleDateString("id-ID")}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="px-4 py-2 text-xs text-destructive border-t">{error}</div>
      )}

      {cert.approval_status === "pending_approval" && (
        <>
          {showReject ? (
            <div className="border-t px-4 py-3 space-y-2">
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Alasan penolakan..."
                rows={2}
                className="w-full text-sm rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" onClick={handleReject} disabled={isPending} className="gap-1.5">
                  {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                  Tolak
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
                <XCircle className="h-3.5 w-3.5" />
                Tolak
              </button>
              <button
                onClick={handleApprove}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
                Setujui
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
