import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApprovalCard } from "./approval-card";
import { CheckSquare } from "lucide-react";

export default async function ApprovalPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch pending change requests
  const { data: requests } = await supabase
    .from("change_requests")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  // Fetch requester names via admin client (need to join auth.users)
  const db = createAdminClient();
  const requesterIds = [...new Set((requests ?? []).map((r) => r.requester_id))];

  // Get names from member_profiles and coach_profiles based on resource_type
  const memberResourceIds = (requests ?? [])
    .filter((r) => r.resource_type === "member_profile")
    .map((r) => r.resource_id);
  const coachResourceIds = (requests ?? [])
    .filter((r) => r.resource_type === "coach_profile")
    .map((r) => r.resource_id);

  const [{ data: memberProfiles }, { data: coachProfiles }] = await Promise.all([
    memberResourceIds.length > 0
      ? db.from("member_profiles").select("member_id, full_name").in("member_id", memberResourceIds)
      : Promise.resolve({ data: [] }),
    coachResourceIds.length > 0
      ? db.from("coach_profiles").select("coach_id, full_name").in("coach_id", coachResourceIds)
      : Promise.resolve({ data: [] }),
  ]);

  const memberNameMap = Object.fromEntries(
    (memberProfiles ?? []).map((p) => [p.member_id, p.full_name])
  );
  const coachNameMap = Object.fromEntries(
    (coachProfiles ?? []).map((p) => [p.coach_id, p.full_name])
  );

  const enriched = (requests ?? []).map((r) => ({
    ...r,
    subject_name:
      r.resource_type === "member_profile"
        ? memberNameMap[r.resource_id] ?? "—"
        : coachNameMap[r.resource_id] ?? "—",
  }));

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Persetujuan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {enriched.length} permintaan menunggu persetujuan
        </p>
      </div>

      {enriched.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground flex flex-col items-center gap-3">
          <CheckSquare className="h-10 w-10 opacity-30" />
          <p>Tidak ada permintaan yang perlu disetujui.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enriched.map((req) => (
            <ApprovalCard key={req.id} request={req} />
          ))}
        </div>
      )}
    </div>
  );
}
