"use client";

import { useRouter } from "next/navigation";

interface Semester {
  id: string;
  name: string;
}

interface RapotFilterProps {
  semesterFilter: string;
  statusFilter: string;
  semesters: Semester[];
}

export function RapotFilter({ semesterFilter, statusFilter, semesters }: RapotFilterProps) {
  const router = useRouter();

  function push(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (semesterFilter) p.set("semester_id", semesterFilter);
    if (statusFilter) p.set("status", statusFilter);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === "") p.delete(k);
      else p.set(k, v);
    });
    p.delete("page");
    const s = p.toString();
    router.push(`/a/rapot${s ? `?${s}` : ""}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <select
        value={semesterFilter}
        onChange={(e) => push({ semester_id: e.target.value || undefined })}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Semua Semester</option>
        {semesters.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <select
        value={statusFilter}
        onChange={(e) => push({ status: e.target.value || undefined })}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Semua Status</option>
        <option value="published">Dipublikasikan</option>
        <option value="draft">Draft</option>
      </select>
    </div>
  );
}
