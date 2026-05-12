import { cacheLife, cacheTag } from "next/cache";
import { createAdminClient } from "@/utils/supabase/server";

export interface AdminDashboardStats {
  totalMembers: number;
  activeMembers: number;
  totalCoaches: number;
  totalClasses: number;
  pendingRegistrations: number;
  pendingApprovals: number;
  todayClasses: { scheduleId: string; classId: string; name: string; start_time: string; end_time: string }[];
  todayDow: number;
  todayDate: string;
}

export async function getAdminDashboardStats(branchId: string): Promise<AdminDashboardStats> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`stats-admin-${branchId}`);

  const db = createAdminClient();
  const todayDow = new Date().getDay();
  const todayDate = new Date().toISOString().split("T")[0];

  const [
    { count: totalMembers },
    { count: activeMembers },
    { count: totalCoaches },
    { count: totalClasses },
    { count: pendingRegistrations },
    { count: pendingApprovals },
    todayClassesRes,
  ] = await Promise.all([
    db.from("members").select("*", { count: "exact", head: true })
      .eq("branch_id", branchId).is("deleted_at", null),
    db.from("members").select("*", { count: "exact", head: true })
      .eq("branch_id", branchId).is("deleted_at", null).eq("status", "active"),
    db.from("coach_branches").select("*", { count: "exact", head: true })
      .eq("branch_id", branchId),
    db.from("classes").select("*", { count: "exact", head: true })
      .eq("branch_id", branchId).is("deleted_at", null).eq("status", "active"),
    db.from("members").select("*", { count: "exact", head: true })
      .eq("branch_id", branchId).is("deleted_at", null).eq("status", "pending_payment"),
    db.from("change_requests").select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    db.from("class_schedules")
      .select("id, start_time, end_time, classes!inner(id, name, status)")
      .eq("day_of_week", todayDow)
      .eq("classes.branch_id", branchId)
      .eq("classes.status", "active")
      .is("classes.deleted_at", null),
  ]);

  const todayClasses = (todayClassesRes.data ?? []).map((s) => {
    const cls = Array.isArray(s.classes) ? s.classes[0] : s.classes;
    return {
      scheduleId: s.id,
      classId: (cls as any)?.id ?? "",
      name: (cls as any)?.name ?? "—",
      start_time: s.start_time,
      end_time: s.end_time,
    };
  });

  return {
    totalMembers: totalMembers ?? 0,
    activeMembers: activeMembers ?? 0,
    totalCoaches: totalCoaches ?? 0,
    totalClasses: totalClasses ?? 0,
    pendingRegistrations: pendingRegistrations ?? 0,
    pendingApprovals: pendingApprovals ?? 0,
    todayClasses,
    todayDow,
    todayDate,
  };
}

export interface OwnerBranchStats {
  id: string;
  name: string;
  status: string;
  is_default: boolean;
  memberCount: number;
  coachCount: number;
  classCount: number;
  activeRate: number;
}

export async function getOwnerBranchStats(branchId: string, branchName: string, branchStatus: string, isDefault: boolean): Promise<OwnerBranchStats> {
  "use cache";
  cacheLife("minutes");
  cacheTag(`stats-branch-${branchId}`);

  const db = createAdminClient();
  const [
    { count: memberCount },
    { count: activeCount },
    { count: coachCount },
    { count: classCount },
  ] = await Promise.all([
    db.from("members").select("*", { count: "exact", head: true }).eq("branch_id", branchId).is("deleted_at", null),
    db.from("members").select("*", { count: "exact", head: true }).eq("branch_id", branchId).eq("status", "active").is("deleted_at", null),
    db.from("coach_branches").select("*", { count: "exact", head: true }).eq("branch_id", branchId),
    db.from("classes").select("*", { count: "exact", head: true }).eq("branch_id", branchId).eq("status", "active").is("deleted_at", null),
  ]);

  const total = memberCount ?? 0;
  const active = activeCount ?? 0;
  return {
    id: branchId,
    name: branchName,
    status: branchStatus,
    is_default: isDefault,
    memberCount: total,
    coachCount: coachCount ?? 0,
    classCount: classCount ?? 0,
    activeRate: total > 0 ? Math.round((active / total) * 100) : 0,
  };
}
