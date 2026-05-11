import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { SemesterActions } from "./semester-actions";
import { CreateSemesterForm } from "./create-semester-form";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  active: "Aktif",
  closed: "Selesai",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  draft: "outline",
  active: "default",
  closed: "secondary",
};

export default async function SemesterPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: semesters }, { data: branches }] = await Promise.all([
    supabase
      .from("semesters")
      .select("id, name, start_date, end_date, input_deadline, status, branch_id, branches(name)")
      .order("start_date", { ascending: false }),
    supabase
      .from("branches")
      .select("id, name")
      .eq("status", "active")
      .is("deleted_at", null),
  ]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Manajemen Semester</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Kelola periode semester dan deadline input rapot pelatih.
        </p>
      </div>

      {/* Create form */}
      <div className="rounded-lg border bg-card p-4 md:p-6">
        <h2 className="font-semibold mb-4">Buat Semester Baru</h2>
        <CreateSemesterForm branches={branches ?? []} />
      </div>

      {/* Semester list */}
      <div className="space-y-3">
        {(!semesters || semesters.length === 0) ? (
          <div className="rounded-lg border border-dashed px-6 py-12 text-center text-muted-foreground text-sm">
            Belum ada semester. Buat semester pertama di atas.
          </div>
        ) : (
          (semesters ?? []).map((s) => {
            const branch = Array.isArray(s.branches) ? s.branches[0] : s.branches;
            return (
              <div key={s.id} className="rounded-lg border bg-card">
                <div className="px-4 md:px-6 pt-4 pb-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{s.name}</p>
                      <Badge variant={STATUS_VARIANT[s.status] ?? "outline"}>
                        {STATUS_LABEL[s.status] ?? s.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {branch?.name ?? "—"} · {new Date(s.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} — {new Date(s.end_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Deadline input rapot: {new Date(s.input_deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <SemesterActions semesterId={s.id} currentStatus={s.status as "draft" | "active" | "closed"} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
