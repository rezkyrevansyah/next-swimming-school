import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function CoachMemberPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!coach) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="font-medium">Profil pelatih tidak ditemukan.</p>
      </div>
    );
  }

  // Get classes this coach teaches
  const { data: coachClasses } = await supabase
    .from("class_coaches")
    .select("class_id")
    .eq("coach_id", coach.id);

  const classIds = (coachClasses ?? []).map((cc) => cc.class_id);

  // Get enrolled members across those classes
  const enrollments =
    classIds.length > 0
      ? await supabase
          .from("class_members")
          .select(
            "member_id, class_id, status, classes(name), members!inner(id, member_id_code, status, member_profiles(full_name, phone))"
          )
          .in("class_id", classIds)
          .eq("status", "enrolled")
      : { data: [] };

  const rawList = enrollments.data ?? [];

  // Deduplicate by member_id, collect their class names
  const memberMap = new Map<
    string,
    { id: string; code: string; name: string; phone: string | null; status: string; classNames: string[] }
  >();

  for (const e of rawList) {
    const m = Array.isArray(e.members) ? e.members[0] : e.members;
    const mProfile = Array.isArray(m?.member_profiles) ? m?.member_profiles[0] : m?.member_profiles;
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    if (!m) continue;
    const existing = memberMap.get(m.id);
    if (existing) {
      if (cls?.name) existing.classNames.push(cls.name);
    } else {
      memberMap.set(m.id, {
        id: m.id,
        code: m.member_id_code ?? "",
        name: mProfile?.full_name ?? "—",
        phone: mProfile?.phone ?? null,
        status: m.status ?? "active",
        classNames: cls?.name ? [cls.name] : [],
      });
    }
  }

  const members = Array.from(memberMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "id")
  );

  return (
    <div className="pb-24">
      <div className="sticky top-0 bg-background border-b px-4 py-3 z-10">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold">Anggota Binaan</h1>
          <span className="ml-auto text-sm text-muted-foreground">{members.length} anggota</span>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
          <Users className="h-12 w-12" />
          <p className="text-sm">Belum ada anggota di kelas Anda.</p>
        </div>
      ) : (
        <div className="divide-y">
          {members.map((m) => (
            <Link
              key={m.id}
              href={`/c/member/${m.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {m.classNames.join(" · ") || "—"}
                </p>
              </div>
              <Badge variant={m.status === "active" ? "default" : "outline"} className="text-xs shrink-0">
                {m.status === "active" ? "Aktif" : m.status}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
