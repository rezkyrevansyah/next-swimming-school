"use client";

import { useState, useTransition } from "react";
import { Pencil, X, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitChangeRequest } from "@/lib/actions/change-request";

interface Profile {
  member_id: string;
  full_name: string;
  nickname: string | null;
  dob: string | null;
  gender: string | null;
  phone: string | null;
  phone_owner: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  address: string | null;
  health_history: string | null;
}

const inputCls =
  "w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

const GENDER_OPTIONS = [
  { value: "male", label: "Laki-laki" },
  { value: "female", label: "Perempuan" },
];

const PHONE_OWNER_OPTIONS = [
  { value: "self", label: "Nomor Sendiri" },
  { value: "parent", label: "Nomor Orang Tua" },
];

export function EditProfilForm({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form state — pre-fill with current values
  const [fullName, setFullName] = useState(profile.full_name);
  const [nickname, setNickname] = useState(profile.nickname ?? "");
  const [dob, setDob] = useState(profile.dob ?? "");
  const [gender, setGender] = useState(profile.gender ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [phoneOwner, setPhoneOwner] = useState(profile.phone_owner ?? "self");
  const [parentName, setParentName] = useState(profile.parent_name ?? "");
  const [parentPhone, setParentPhone] = useState(profile.parent_phone ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [healthHistory, setHealthHistory] = useState(profile.health_history ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);

    // Build diff — only include changed fields
    const changes: Record<string, { old: string | null; new: string | null }> = {};

    const compare = (
      field: string,
      oldVal: string | null,
      newVal: string
    ) => {
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
    compare("phone_owner", profile.phone_owner, phoneOwner);
    compare("parent_name", profile.parent_name, parentName);
    compare("parent_phone", profile.parent_phone, parentPhone);
    compare("address", profile.address, address);
    compare("health_history", profile.health_history, healthHistory);

    if (Object.keys(changes).length === 0) {
      setResult({ type: "error", message: "Tidak ada perubahan yang terdeteksi." });
      return;
    }

    startTransition(async () => {
      const res = await submitChangeRequest("member_profile", profile.member_id, changes);
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">No. HP</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Pemilik HP</label>
            <select value={phoneOwner} onChange={(e) => setPhoneOwner(e.target.value)} className={inputCls}>
              {PHONE_OWNER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium">Nama Orang Tua/Wali</label>
            <input value={parentName} onChange={(e) => setParentName(e.target.value)} className={inputCls} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium">No. HP Orang Tua</label>
            <input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium">Alamat</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium">Riwayat Kesehatan</label>
          <textarea
            value={healthHistory}
            onChange={(e) => setHealthHistory(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
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
