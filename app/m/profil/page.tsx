import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { QrCode } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const GENDER_LABEL: Record<string, string> = {
  male: "Laki-laki",
  female: "Perempuan",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function MemberProfilPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select(`
      id, member_id_code, status, type, created_at,
      branches(name),
      member_profiles(full_name, nickname, dob, gender, phone, phone_owner, parent_name, parent_phone, address, health_history)
    `)
    .eq("user_id", user.id)
    .single();

  if (!member) redirect("/login");

  const profile = Array.isArray(member.member_profiles)
    ? member.member_profiles[0]
    : member.member_profiles;

  const branch = Array.isArray(member.branches) ? member.branches[0] : member.branches;

  const fields = [
    { label: "Nama Lengkap", value: profile?.full_name ?? "—" },
    { label: "Nama Panggilan", value: profile?.nickname || "—" },
    { label: "Tanggal Lahir", value: formatDate(profile?.dob ?? null) },
    { label: "Jenis Kelamin", value: GENDER_LABEL[profile?.gender ?? ""] ?? "—" },
    { label: "No. HP", value: profile?.phone || "—" },
    { label: "Pemilik HP", value: profile?.phone_owner || "—" },
    { label: "Nama Orang Tua/Wali", value: profile?.parent_name || "—" },
    { label: "No. HP Orang Tua", value: profile?.parent_phone || "—" },
    { label: "Alamat", value: profile?.address || "—" },
    { label: "Riwayat Kesehatan", value: profile?.health_history || "—" },
  ];

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="pt-2">
        <h1 className="text-xl font-semibold">Profil Saya</h1>
      </div>

      {/* Member card */}
      <div className="rounded-xl border p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-lg leading-tight">{profile?.full_name ?? "—"}</p>
            <p className="text-sm text-muted-foreground font-mono mt-0.5">{member.member_id_code}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge variant={member.status === "active" ? "default" : "secondary"}>
              {member.status === "active" ? "Aktif" : "Tidak Aktif"}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-1 border-t">
          {branch?.name && <span>Cabang: {branch.name}</span>}
          {member.type && <span>· Tipe: {member.type === "regular" ? "Reguler" : member.type === "special" ? "Khusus" : member.type}</span>}
          <span>· Bergabung: {formatDate(member.created_at ?? null)}</span>
        </div>
      </div>

      {/* QR shortcut */}
      <Link
        href="/m/qr"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "w-full gap-2 justify-center"
        )}
      >
        <QrCode className="h-4 w-4" />
        Tampilkan QR Code
      </Link>

      {/* Profile details */}
      <div className="rounded-xl border divide-y">
        {fields.map(({ label, value }) => (
          <div key={label} className="px-4 py-3 flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm">{value}</span>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground pb-2">
        Untuk mengubah data, hubungi admin atau pelatih.
      </p>
    </div>
  );
}
