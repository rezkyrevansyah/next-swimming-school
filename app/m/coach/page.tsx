import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function MemberCoachPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!member) redirect("/login");

  // Get enrolled classes → coaches
  const { data: enrollments } = await supabase
    .from("class_members")
    .select(`
      classes!inner(
        id, name, status,
        class_coaches(
          coaches(
            id,
            coach_profiles(full_name, phone, bio)
          )
        )
      )
    `)
    .eq("member_id", member.id)
    .eq("status", "enrolled");

  // Flatten + dedupe coaches, collecting which classes they teach
  type CoachEntry = { id: string; name: string; phone: string | null; bio: string | null; classes: string[] };
  const coachMap = new Map<string, CoachEntry>();

  (enrollments ?? []).forEach((e) => {
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    if (!cls || cls.status !== "active") return;

    (cls.class_coaches ?? []).forEach((cc: { coaches: unknown }) => {
      const coach = Array.isArray(cc.coaches) ? cc.coaches[0] : cc.coaches;
      if (!coach?.id) return;
      const cp = Array.isArray(coach.coach_profiles) ? coach.coach_profiles[0] : coach.coach_profiles;
      if (!cp?.full_name) return;

      if (!coachMap.has(coach.id)) {
        coachMap.set(coach.id, {
          id: coach.id,
          name: cp.full_name,
          phone: cp.phone ?? null,
          bio: cp.bio ?? null,
          classes: [],
        });
      }
      const entry = coachMap.get(coach.id)!;
      if (!entry.classes.includes(cls.name)) entry.classes.push(cls.name);
    });
  });

  const coaches = Array.from(coachMap.values());

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="pt-2">
        <h1 className="text-xl font-semibold">Pelatih Saya</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Pelatih dari kelas yang kamu ikuti</p>
      </div>

      {coaches.length === 0 ? (
        <div className="rounded-xl border px-4 py-10 text-center text-sm text-muted-foreground">
          Belum ada pelatih. Hubungi admin untuk pendaftaran kelas.
        </div>
      ) : (
        <div className="space-y-3">
          {coaches.map((c) => (
            <div key={c.id} className="rounded-xl border px-4 py-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{c.name}</p>
                  {c.classes.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.classes.join(", ")}
                    </p>
                  )}
                </div>
                {c.phone && (
                  <a
                    href={`https://wa.me/${c.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 shrink-0")}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    WA
                  </a>
                )}
              </div>
              {c.bio && (
                <p className="text-sm text-muted-foreground">{c.bio}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
