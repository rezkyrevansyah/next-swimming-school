"use client";

import { useState, useTransition, useRef } from "react";
import { Plus, Trash2, Loader2, Award, CheckCircle, Clock, XCircle, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { uploadCertificate, deleteCertificate } from "@/lib/actions/coach";

interface Certificate {
  id: string;
  name: string;
  photo_url: string | null;
  issued_year: number | null;
  valid_until: string | null;
  no_expiry: boolean;
  approval_status: string;
  approval_notes: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; icon: React.ElementType }> = {
  approved: { label: "Disetujui", variant: "default", icon: CheckCircle },
  pending_approval: { label: "Menunggu", variant: "secondary", icon: Clock },
  rejected: { label: "Ditolak", variant: "destructive", icon: XCircle },
};

const inputCls = "w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

export function CertificateSection({ initialCerts }: { initialCerts: Certificate[] }) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [noExpiry, setNoExpiry] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const formData = new FormData(e.currentTarget);
    formData.set("no_expiry", noExpiry ? "true" : "false");
    startTransition(async () => {
      const res = await uploadCertificate(formData);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess("Sertifikat berhasil dikirim, menunggu persetujuan admin.");
        setShowForm(false);
        setPreviewUrl(null);
        setNoExpiry(false);
        formRef.current?.reset();
      }
    });
  }

  function handleDelete(certId: string) {
    setDeleteId(certId);
    startTransition(async () => {
      const res = await deleteCertificate(certId);
      setDeleteId(null);
      if (res.error) setError(res.error);
    });
  }

  const currentYear = new Date().getFullYear();

  return (
    <div className="rounded-xl border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sertifikat</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 h-7 text-xs"
          onClick={() => { setShowForm(!showForm); setError(null); setSuccess(null); }}
        >
          <Plus className="h-3.5 w-3.5" />
          Tambah
        </Button>
      </div>

      {/* Upload form */}
      {showForm && (
        <form ref={formRef} onSubmit={handleUpload} className="space-y-3 rounded-lg border p-4 bg-muted/30">
          <p className="text-xs font-medium">Sertifikat Baru</p>

          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Nama Sertifikat <span className="text-destructive">*</span></label>
            <input name="name" required placeholder="Contoh: Renang Level 2" className={inputCls} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Tahun Terbit <span className="text-destructive">*</span></label>
              <input
                name="issued_year"
                type="number"
                required
                min={1970}
                max={currentYear + 1}
                defaultValue={currentYear}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground">Berlaku Sampai</label>
              <input
                name="valid_until"
                type="date"
                disabled={noExpiry}
                className={inputCls + (noExpiry ? " opacity-50" : "")}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={noExpiry}
              onChange={(e) => setNoExpiry(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            Tidak ada batas berlaku
          </label>

          {/* Photo upload */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Foto Sertifikat</label>
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="max-h-32 mx-auto rounded object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                  <ImageIcon className="h-8 w-8 opacity-40" />
                  <p className="text-xs">Klik untuk pilih foto</p>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              name="photo"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending} className="gap-1.5">
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Kirim
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => { setShowForm(false); setPreviewUrl(null); }}>
              Batal
            </Button>
          </div>
        </form>
      )}

      {success && (
        <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
          {success}
        </p>
      )}

      {/* Certificate list */}
      {initialCerts.length === 0 && !showForm ? (
        <p className="text-sm text-muted-foreground text-center py-2">Belum ada sertifikat.</p>
      ) : (
        <div className="space-y-2">
          {initialCerts.map((cert) => {
            const cfg = STATUS_CONFIG[cert.approval_status] ?? STATUS_CONFIG.pending_approval;
            const StatusIcon = cfg.icon;
            return (
              <div key={cert.id} className="rounded-lg border bg-background p-3 flex items-start gap-3">
                {cert.photo_url ? (
                  <img
                    src={cert.photo_url}
                    alt={cert.name}
                    className="h-12 w-12 rounded object-cover border shrink-0"
                  />
                ) : (
                  <div className="h-12 w-12 rounded border bg-muted flex items-center justify-center shrink-0">
                    <Award className="h-5 w-5 text-muted-foreground opacity-50" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-sm font-medium truncate">{cert.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {cert.issued_year}
                    {cert.no_expiry
                      ? " · Tidak ada batas berlaku"
                      : cert.valid_until
                      ? ` · s.d. ${new Date(cert.valid_until).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`
                      : ""}
                  </p>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Badge variant={cfg.variant} className="text-xs gap-1 py-0">
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </Badge>
                  </div>
                  {cert.approval_notes && cert.approval_status === "rejected" && (
                    <p className="text-xs text-destructive mt-1">{cert.approval_notes}</p>
                  )}
                </div>
                {cert.approval_status !== "approved" && (
                  <button
                    onClick={() => handleDelete(cert.id)}
                    disabled={isPending && deleteId === cert.id}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    title="Hapus sertifikat"
                  >
                    {isPending && deleteId === cert.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
