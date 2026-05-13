"use client";

import { useRouter } from "next/navigation";

interface Coach {
  id: string;
  name: string;
}

interface AbsensiCoachFilterProps {
  coachFilter: string;
  dateFrom: string;
  dateTo: string;
  suspiciousOnly: boolean;
  coaches: Coach[];
}

export function AbsensiCoachFilter({
  coachFilter,
  dateFrom,
  dateTo,
  suspiciousOnly,
  coaches,
}: AbsensiCoachFilterProps) {
  const router = useRouter();

  function push(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (coachFilter) p.set("coach_id", coachFilter);
    if (dateFrom) p.set("date_from", dateFrom);
    if (dateTo) p.set("date_to", dateTo);
    if (suspiciousOnly) p.set("suspicious", "1");
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === "") p.delete(k);
      else p.set(k, v);
    });
    const s = p.toString();
    router.push(`/a/absensi/coach${s ? `?${s}` : ""}`);
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      <select
        value={coachFilter}
        onChange={(e) => push({ coach_id: e.target.value || undefined, page: undefined })}
        className="col-span-2 md:col-span-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">Semua Pelatih</option>
        {coaches.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <input
        type="date"
        value={dateFrom}
        onChange={(e) => push({ date_from: e.target.value || undefined, page: undefined })}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <input
        type="date"
        value={dateTo}
        onChange={(e) => push({ date_to: e.target.value || undefined, page: undefined })}
        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <label className="flex items-center gap-2 h-9 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={suspiciousOnly}
          onChange={(e) => push({ suspicious: e.target.checked ? "1" : undefined, page: undefined })}
          className="h-4 w-4 rounded border-input"
        />
        Hanya mencurigakan
      </label>
    </div>
  );
}
