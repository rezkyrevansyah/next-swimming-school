"use client";

import { useState, useTransition } from "react";
import { Check, X, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { approveChangeRequest, rejectChangeRequest } from "@/lib/actions/change-request";

type ChangeField = { old: string | null; new: string | null };

interface Request {
  id: string;
  resource_type: string;
  resource_id: string;
  changes: Record<string, ChangeField>;
  created_at: string;
  subject_name: string;
}

const FIELD_LABEL: Record<string, string> = {
  full_name: "Nama Lengkap",
  nickname: "Nama Panggilan",
  dob: "Tanggal Lahir",
  gender: "Jenis Kelamin",
  phone: "No. HP",
  phone_owner: "Pemilik HP",
  parent_name: "Nama Orang Tua",
  parent_phone: "No. HP Orang Tua",
  address: "Alamat",
  health_history: "Riwayat Kesehatan",
  specializations: "Spesialisasi",
};

const RESOURCE_LABEL: Record<string, string> = {
  member_profile: "Anggota",
  coach_profile: "Pelatih",
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function ApprovalCard({ request }: { request: Request }) {
  const [expanded, setExpanded] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const changes = request.changes as Record<string, ChangeField>;
  const changedFields = Object.entries(changes);

  function handleApprove() {
    startTransition(async () => {
      const res = await approveChangeRequest(request.id);
      if (res.error) setResult({ type: "error", message: res.error });
      else setResult({ type: "success", message: "Disetujui." });
    });
  }

  function handleReject() {
    startTransition(async () => {
      const res = await rejectChangeRequest(request.id, rejectNote);
      if (res.error) setResult({ type: "error", message: res.error });
      else setResult({ type: "success", message: "Ditolak." });
    });
  }

  if (result?.type === "success") {
    return (
      <div className="rounded-xl border bg-muted/40 px-5 py-4 text-sm text-muted-foreground">
        ✓ {result.message}
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{request.subject_name}</span>
            <Badge variant="outline" className="text-xs">
              {RESOURCE_LABEL[request.resource_type] ?? request.resource_type}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Dikirim {formatDate(request.created_at)} · {changedFields.length} field diubah
          </p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && (
        <div className="border-t px-5 py-4 space-y-3">
          <div className="space-y-2">
            {changedFields.map(([field, { old: oldVal, new: newVal }]) => (
              <div key={field} className="grid grid-cols-[auto_1fr_1fr] gap-3 text-sm items-start">
                <span className="text-xs text-muted-foreground pt-0.5 min-w-[110px]">
                  {FIELD_LABEL[field] ?? field}
                </span>
                <div className="rounded bg-destructive/5 border border-destructive/20 px-2 py-1 text-xs line-through text-muted-foreground">
                  {oldVal ?? <em>kosong</em>}
                </div>
                <div className="rounded bg-green-50 border border-green-200 px-2 py-1 text-xs text-green-800">
                  {newVal ?? <em>kosong</em>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {result?.type === "error" && (
        <div className="border-t px-5 py-2 text-xs text-destructive">{result.message}</div>
      )}

      {showRejectForm ? (
        <div className="border-t px-5 py-4 space-y-3">
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
              onClick={handleReject}
              disabled={isPending}
              className="gap-1.5"
            >
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
              Konfirmasi Tolak
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowRejectForm(false)}>
              Batal
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-t flex divide-x">
          <button
            onClick={() => { setExpanded(true); setShowRejectForm(true); }}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Tolak
          </button>
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Setujui
          </button>
        </div>
      )}
    </div>
  );
}
