import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/utils/auth-helpers";
import { IzinClient } from "./izin-client";

function IzinSkeleton() {
  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto pb-24 animate-pulse">
      <div className="pt-2 space-y-1">
        <div className="h-7 w-44 bg-muted rounded" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>
      <div className="h-40 bg-muted rounded-xl" />
      <div className="h-5 w-28 bg-muted rounded" />
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-xl" />
      ))}
    </div>
  );
}

export default async function MemberIzinPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");

  return (
    <Suspense fallback={<IzinSkeleton />}>
      <IzinServerData userId={userId} />
    </Suspense>
  );
}

async function IzinServerData({ userId }: { userId: string }) {
  const supabase = createClient(await cookies());

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!member) redirect("/login");

  const todayDate = new Date().toISOString().slice(0, 10);

  const [{ data: enrollments }, { data: leaveData }] = await Promise.all([
    supabase
      .from("class_members")
      .select("class_id, classes!inner(id, name)")
      .eq("member_id", member.id)
      .eq("status", "enrolled")
      .eq("classes.status", "active"),
    supabase
      .from("member_leaves")
      .select("id, class_id, leave_date, reason, classes(name)")
      .eq("member_id", member.id)
      .gte("leave_date", todayDate)
      .order("leave_date", { ascending: true }),
  ]);

  const classes = (enrollments ?? []).map((e) => {
    const cls = Array.isArray(e.classes) ? e.classes[0] : e.classes;
    return { class_id: e.class_id, name: (cls as { name?: string } | null)?.name ?? e.class_id };
  });

  const leaves = (leaveData ?? []).map((l) => {
    const cls = Array.isArray(l.classes) ? l.classes[0] : l.classes;
    return {
      id: l.id,
      class_id: l.class_id,
      leave_date: l.leave_date,
      reason: l.reason,
      class_name: (cls as { name?: string } | null)?.name ?? "—",
    };
  });

  return <IzinClient memberId={member.id} initialClasses={classes} initialLeaves={leaves} />;
}
