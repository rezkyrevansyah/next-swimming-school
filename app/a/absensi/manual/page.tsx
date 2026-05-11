import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ManualAttendanceForm } from "./manual-attendance-form";

export default async function AbsensiManualPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch active members + classes for dropdowns
  const [{ data: members }, { data: classes }] = await Promise.all([
    supabase
      .from("members")
      .select("id, member_id_code, member_profiles(full_name)")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("member_id_code"),
    supabase
      .from("classes")
      .select("id, name")
      .eq("status", "active")
      .is("deleted_at", null)
      .order("name"),
  ]);

  // Normalize nested profiles
  const memberOptions = (members ?? []).map((m) => {
    const p = Array.isArray(m.member_profiles) ? m.member_profiles[0] : m.member_profiles;
    return {
      id: m.id,
      label: `${p?.full_name ?? "—"} (${m.member_id_code})`,
    };
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-xl">
      <div>
        <Link
          href="/a/absensi"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Rekap Absensi
        </Link>
        <h1 className="text-xl md:text-2xl font-semibold">Input Absensi Manual</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Untuk izin, sakit, atau koreksi absensi yang tidak terekam otomatis.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-4 md:p-6">
        <ManualAttendanceForm
          members={memberOptions}
          classes={(classes ?? []).map((c) => ({ id: c.id, name: c.name }))}
        />
      </div>
    </div>
  );
}
