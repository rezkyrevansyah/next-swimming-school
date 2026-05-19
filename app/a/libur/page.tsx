import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { HolidayManager } from "./holiday-form";
import { getCachedBranches, getCachedActiveClasses } from "@/lib/cache/master-data";

function PageSkeleton() {
  return (
    <div className="p-6 space-y-4 max-w-4xl animate-pulse">
      <div className="h-7 w-32 bg-muted rounded" />
      <div className="h-10 w-32 bg-muted rounded" />
      <div className="h-48 bg-muted rounded-xl" />
    </div>
  );
}

async function PageContent() {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [branches, classes, { data: holidays }] = await Promise.all([
    getCachedBranches(),
    getCachedActiveClasses(),
    supabase
      .from("class_holidays")
      .select(`
        id, holiday_date, name, branch_id, class_id,
        branches(name),
        classes(name)
      `)
      .order("holiday_date", { ascending: false }),
  ]);

  const holidayRows = (holidays ?? []).map((h) => {
    const branch = Array.isArray(h.branches) ? h.branches[0] : h.branches;
    const cls = Array.isArray(h.classes) ? h.classes[0] : h.classes;
    return {
      id: h.id,
      holiday_date: h.holiday_date,
      name: h.name,
      branch_id: h.branch_id,
      class_id: h.class_id,
      branch_name: (branch as any)?.name ?? null,
      class_name: (cls as any)?.name ?? null,
    };
  });

  return (
    <div className="p-6 max-w-4xl">
      <HolidayManager
        branches={branches}
        classes={classes}
        holidays={holidayRows}
      />
    </div>
  );
}

export default function LiburPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContent />
    </Suspense>
  );
}
