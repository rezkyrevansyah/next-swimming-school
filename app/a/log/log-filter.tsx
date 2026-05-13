"use client";

import { useRouter } from "next/navigation";

interface LogFilterProps {
  actionFilter: string;
  resourceFilter: string;
  dateFrom: string;
  dateTo: string;
  uniqueActions: string[];
  uniqueResources: string[];
  actionLabel: Record<string, string>;
}

export function LogFilter({
  actionFilter,
  resourceFilter,
  dateFrom,
  dateTo,
  uniqueActions,
  uniqueResources,
  actionLabel,
}: LogFilterProps) {
  const router = useRouter();

  function push(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (actionFilter) p.set("action", actionFilter);
    if (resourceFilter) p.set("resource_type", resourceFilter);
    if (dateFrom) p.set("date_from", dateFrom);
    if (dateTo) p.set("date_to", dateTo);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === "") p.delete(k);
      else p.set(k, v);
    });
    p.delete("page");
    const s = p.toString();
    router.push(`/a/log${s ? `?${s}` : ""}`);
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <select
        value={actionFilter}
        onChange={(e) => push({ action: e.target.value || undefined })}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Semua Aksi</option>
        {uniqueActions.map((a) => (
          <option key={a} value={a}>{actionLabel[a] ?? a}</option>
        ))}
      </select>

      <select
        value={resourceFilter}
        onChange={(e) => push({ resource_type: e.target.value || undefined })}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Semua Tipe</option>
        {uniqueResources.map((r) => (
          <option key={r} value={r} className="capitalize">{r}</option>
        ))}
      </select>

      <input
        type="date"
        value={dateFrom}
        onChange={(e) => push({ date_from: e.target.value || undefined })}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <input
        type="date"
        value={dateTo}
        onChange={(e) => push({ date_to: e.target.value || undefined })}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
