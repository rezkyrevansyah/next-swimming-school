import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClockInClient } from "./clock-in-client";

function SimpleSkeleton() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      <div className="h-7 w-40 bg-muted rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-xl" />
      ))}
    </div>
  );
}

async function PageContent() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get coach + primary branch coordinates
  const { data: coach } = await supabase
    .from("coaches")
    .select(`
      id,
      coach_branches!inner(
        branch_id, is_primary,
        branches(id, name, location_lat, location_lng)
      )
    `)
    .eq("user_id", user.id)
    .eq("coach_branches.is_primary", true)
    .single();

  if (!coach) redirect("/c/dashboard");

  const branchEntry = Array.isArray(coach.coach_branches)
    ? coach.coach_branches[0]
    : coach.coach_branches;
  const branch = Array.isArray(branchEntry?.branches)
    ? branchEntry.branches[0]
    : branchEntry?.branches;

  // Check already clocked in today
  const todayDate = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase
    .from("coach_clock_records")
    .select("id, clock_in_at, clock_in_distance_m")
    .eq("coach_id", coach.id)
    .eq("branch_id", branch?.id ?? "")
    .eq("clock_in_date", todayDate)
    .maybeSingle();

  return (
    <ClockInClient
      branchId={branch?.id ?? ""}
      branchName={branch?.name ?? "Cabang"}
      branchLat={branch?.location_lat ? Number(branch.location_lat) : null}
      branchLng={branch?.location_lng ? Number(branch.location_lng) : null}
      existingRecord={existing ? {
        clockInAt: existing.clock_in_at,
        distanceM: existing.clock_in_distance_m ? Number(existing.clock_in_distance_m) : null,
      } : null}
    />
  );
}

export default function ClockInPage() {
  return (
    <Suspense fallback={<SimpleSkeleton />}>
      <PageContent />
    </Suspense>
  );
}
