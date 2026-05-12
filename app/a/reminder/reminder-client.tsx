"use client";

import { useState } from "react";
import { MessageCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Member {
  id: string;
  member_id_code: string;
  full_name: string;
  phone: string | null;
  class_names: string[];
}

const TEMPLATES = [
  {
    id: "tagihan",
    label: "Tagihan Bulanan",
    template: (name: string, classes: string[]) =>
      `Halo ${name} 👋\n\nKami ingin mengingatkan bahwa tagihan bulanan untuk kelas *${classes.join(", ")}* sudah jatuh tempo.\n\nMohon segera lakukan pembayaran agar akses kelas tetap aktif. Terima kasih 🙏\n\n_Next Swimming School_`,
  },
  {
    id: "jadwal",
    label: "Pengingat Jadwal",
    template: (name: string, classes: string[]) =>
      `Halo ${name} 👋\n\nPengingat jadwal latihan untuk kelas *${classes.join(", ")}* akan berlangsung besok.\n\nSampai jumpa di kolam renang! 🏊‍♂️\n\n_Next Swimming School_`,
  },
  {
    id: "rapot",
    label: "Rapot Tersedia",
    template: (name: string, _classes: string[]) =>
      `Halo ${name} 👋\n\nRapot perkembangan semester ini sudah tersedia! Silakan login ke aplikasi untuk melihat hasilnya.\n\nTerima kasih atas kepercayaan Anda 🙏\n\n_Next Swimming School_`,
  },
  {
    id: "kustom",
    label: "Pesan Kustom",
    template: (name: string, _classes: string[]) =>
      `Halo ${name} 👋\n\n`,
  },
];

export function ReminderClient({
  members,
  waNumber,
}: {
  members: Member[];
  waNumber: string;
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(TEMPLATES[0].id);
  const [customMessage, setCustomMessage] = useState("");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const template = TEMPLATES.find((t) => t.id === selectedTemplateId) ?? TEMPLATES[0];

  const filtered = members.filter(
    (m) =>
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.member_id_code.toLowerCase().includes(search.toLowerCase())
  );

  function buildMessage(member: Member) {
    if (selectedTemplateId === "kustom") {
      return customMessage.replace("{nama}", member.full_name);
    }
    return template.template(member.full_name, member.class_names);
  }

  function buildWaUrl(member: Member) {
    const phone = member.phone?.replace(/\D/g, "");
    if (!phone) return null;
    const normalized = phone.startsWith("0") ? "62" + phone.slice(1) : phone;
    const msg = encodeURIComponent(buildMessage(member));
    return `https://wa.me/${normalized}?text=${msg}`;
  }

  async function handleCopy(member: Member) {
    await navigator.clipboard.writeText(buildMessage(member));
    setCopiedId(member.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-5">
      {/* Template selector */}
      <div className="rounded-xl border bg-card p-5 space-y-4">
        <h2 className="font-medium text-sm">Template Pesan</h2>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplateId(t.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedTemplateId === t.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {selectedTemplateId === "kustom" ? (
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Gunakan <code className="bg-muted px-1 rounded">{"{nama}"}</code> untuk nama member.</p>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={5}
              placeholder={`Halo {nama} 👋\n\nTulis pesan kamu di sini...`}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none font-mono"
            />
          </div>
        ) : (
          <div className="rounded-md bg-muted/60 border px-4 py-3 text-xs text-muted-foreground whitespace-pre-line font-mono leading-relaxed">
            {template.template("[Nama Member]", ["Nama Kelas"])}
          </div>
        )}
      </div>

      {/* Member list */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau ID member..."
            className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="text-xs text-muted-foreground shrink-0">{filtered.length} member</span>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            Tidak ada member ditemukan.
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden divide-y">
            {filtered.map((member) => {
              const url = buildWaUrl(member);
              return (
                <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.full_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span>{member.member_id_code}</span>
                      {member.class_names.length > 0 && (
                        <span className="truncate max-w-[200px]">{member.class_names.join(", ")}</span>
                      )}
                      {!member.phone && (
                        <span className="text-destructive">Tidak ada nomor HP</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy(member)}
                      title="Salin pesan"
                      className="h-8 w-8 rounded-md border flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                      {copiedId === member.id ? (
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-8 px-3 rounded-md bg-green-600 text-white text-xs font-medium flex items-center gap-1.5 hover:bg-green-700 transition-colors"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WA
                      </a>
                    ) : (
                      <span className="h-8 px-3 rounded-md bg-muted text-muted-foreground text-xs font-medium flex items-center opacity-50">
                        No HP
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
