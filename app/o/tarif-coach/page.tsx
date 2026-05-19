import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { RateManager } from "@/app/a/tarif-coach/rate-form";
import type { CoachRateRow } from "@/lib/types/coach-invoice";
import {
  getCachedBranches,
  getCachedActiveClasses,
  getCachedActiveCoaches,
} from "@/lib/cache/master-data";

function PageSkeleton() {
  return (
    <div className="p-6 space-y-4 max-w-5xl animate-pulse">
      <div className="h-7 w-40 bg-muted rounded" />
      <div className="h-48 bg-muted rounded-xl" />
    </div>
  );
}

async function PageContent() {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [branches, classes, coaches, { data: rateRows }] = await Promise.all([
    getCachedBranches(),
    getCachedActiveClasses(),
    getCachedActiveCoaches(),
    supabase
      .from("coach_rates")
      .select(`
        id, branch_id, class_id, coach_id, rate_per_session, effective_from, notes,
        branches(name),
        classes(name),
        coaches(coach_profiles(full_name))
      `)
      .order("effective_from", { ascending: false }),
  ]);

  const rates = (rateRows ?? []).map((r): CoachRateRow & { branch_name?: string; class_name?: string; coach_name?: string } => {
    const branch = Array.isArray(r.branches) ? r.branches[0] : r.branches;
    const cls = Array.isArray(r.classes) ? r.classes[0] : r.classes;
    const coachRel = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches;
    const cp = Array.isArray(coachRel?.coach_profiles) ? coachRel.coach_profiles[0] : coachRel?.coach_profiles;
    return {
      id: r.id,
      branch_id: r.branch_id,
      class_id: r.class_id,
      coach_id: r.coach_id,
      rate_per_session: Number(r.rate_per_session),
      effective_from: r.effective_from,
      notes: r.notes,
      branch_name: (branch as any)?.name,
      class_name: (cls as any)?.name,
      coach_name: (cp as any)?.full_name,
    };
  });

  return (
    <div className="p-6 max-w-5xl">
      <RateManager
        branches={branches}
        classes={classes}
        coaches={coaches}
        rates={rates}
      />
    </div>
  );
}

export default function OwnerTarifCoachPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContent />
    </Suspense>
  );
}
