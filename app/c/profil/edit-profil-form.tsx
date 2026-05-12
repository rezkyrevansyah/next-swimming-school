"use client";

import { useState, useTransition } from "react";
import { Pencil, X, Loader2, Send, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitChangeRequest } from "@/lib/actions/change-request";

interface CoachProfile {
  coach_id: string;
  full_name: string;
  nickname: string | null;
  dob: string | null;
  gender: string | null;
  phone: string | null;
  specializations: string[] | null;
}

const inputCls =
  "w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

const GENDER_OPTIONS = [
  { value: "male", label: "Laki-laki" },
  { value: "female", label: "Perempuan" },
];

const COMMON_SPECIALIZATIONS = [
  "Renang Dasar",
  "Renang Kompetisi",
  "Renang Bayi",
  "Renang Anak",
  "Renang Dewasa",
  "Gaya Bebas",
  "Gaya Punggung",
  "Gaya Dada",
  "Gaya Kupu-kupu",
];

export function EditCoachProfilForm({ profile }: { profile: CoachProfile }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [fullName, setFullName] = useState(profile.full_name);
  const [nickname, setNickname] = useState(profile.nickname ?? "");
  const [dob, setDob] = useState(profile.dob ?? "");
  const [gender, setGender] = useState(profile.gender ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [specializations, setSpecializations] = useState<string[]>(profile.specializations ?? []);
  const [newSpec, setNewSpec] = useState("");

  function addSpec(val: string) {
    const trimmed = val.trim();
    if (!trimmed || specializations.includes(trimmed)) return;
    setSpecializations((prev) => [...prev, trimmed]);
    setNewSpec("");
  }

  function removeSpec(val: string) {
    setSpecializations((prev) => prev.filter((s) => s !== val));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    const changes: Record<string, { old: string | null; new: string | null }> = {};

    const compare = (field: string, oldVal: string | null, newVal: string) => {
      const trimmed = newVal.trim() || null;
      if (trimmed !== (oldVal?.trim() ?? null)) {
        changes[field] = { old: oldVal ?? null, new: trimmed };
      }
    };

    compare("full_name", profile.full_name, fullName);
    compare("nickname", profile.nickname, nickname);
    compare("dob", profile.dob, dob);
    compare("gender", profile.gender, gender);
    compare("phone", profile.phone, phone);

    // Compare specializations array serialized
    const oldSpecs = JSON.stringify((profile.specializations ?? []).slice().sort());
    const newSpecs = JSON.stringify(specializations.slice().sort());
    if (oldSpecs !== newSpecs) {
      changes["specializations"] = {
        old: (profile.specializations ?? []).join(", ") || null,
        new: specializations.join(", ") || null,
      };
    }

    if (Object.keys(changes).length === 0) {
      setResult({ type: "error", message: "Tidak ada perubahan yang terdeteksi." });
      return;
    }

    startTransition(async () => {
      const res = await submitChangeRequest("coach_profile", profile.coach_id, changes);
      if (res.error) {
        setResult({ type: "error", message: res.error });
      } else {
        setResult({
          type: "success",
          message: "Permintaan perubahan berhasil dikirim. Admin akan meninjau dan menyetujuinya.",
        });
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <div className="space-y-2">
        <Button variant="outline" className="w-full gap-2" onClick={() => { setResult(null); setOpen(true); }}>
          <Pencil className="h-4 w-4" />
          Ubah Data Profil
        </Button>
        {result?.type === "success" && (
          <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            {result.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">Ubah Data Profil</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
        Perubahan yang kamu kirim akan ditinjau oleh admin sebelum diterapkan.
      </p>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Nama Lengkap <span className="text-destructive">*</span></label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium">Nama Panggilan</label>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputCls} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Tanggal Lahir</label>
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Jenis Kelamin</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputCls}>
              <option value="">Pilih...</option>
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium">No. HP</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
        </div>

        {/* Specializations */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium">Spesialisasi</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {specializations.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2.5 py-0.5"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeSpec(s)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {specializations.length === 0 && (
              <span className="text-xs text-muted-foreground">Belum ada spesialisasi</span>
            )}
          </div>
          {/* Quick-add from common list */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {COMMON_SPECIALIZATIONS.filter((s) => !specializations.includes(s)).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSpec(s)}
                className="rounded-full border text-xs px-2 py-0.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
          {/* Custom spec input */}
          <div className="flex gap-2">
            <input
              value={newSpec}
              onChange={(e) => setNewSpec(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpec(newSpec); } }}
              placeholder="Ketik spesialisasi lain..."
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => addSpec(newSpec)}
              className="h-9 px-3 rounded-md border border-input bg-background hover:bg-accent transition-colors shrink-0"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {result?.type === "error" && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {result.message}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full gap-2">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Kirim Permintaan Perubahan
      </Button>
    </form>
  );
}
