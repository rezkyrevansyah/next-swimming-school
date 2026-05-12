import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CoachQrCard } from "./coach-qr-card";

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

  const { data: coach } = await supabase
    .from("coaches")
    .select("id, coach_id_code, coach_profiles(full_name)")
    .eq("user_id", user.id)
    .single();

  if (!coach) redirect("/c/dashboard");

  const profile = Array.isArray(coach.coach_profiles)
    ? coach.coach_profiles[0]
    : coach.coach_profiles;

  return (
    <>
      <h1 className="text-lg font-semibold mb-1">{profile?.full_name ?? "—"}</h1>
      <p className="text-xs text-muted-foreground font-mono mb-6">{coach.coach_id_code}</p>
      <CoachQrCard
        coachId={coach.id}
        coachCode={coach.coach_id_code}
        fullName={profile?.full_name ?? ""}
      />
    </>
  );
}

export default function CoachQrPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 pb-24">
      <Suspense fallback={<SimpleSkeleton />}>
        <PageContent />
      </Suspense>
    </div>
  );
}
