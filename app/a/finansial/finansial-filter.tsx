"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface FinansialFilterProps {
  statusFilter: string;
  periodFilter: string;
  uniquePeriods: string[];
}

function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
}

export function FinansialFilter({ statusFilter, periodFilter, uniquePeriods }: FinansialFilterProps) {
  const router = useRouter();

  function push(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (statusFilter) p.set("status", statusFilter);
    if (periodFilter) p.set("period", periodFilter);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v === undefined || v === "") p.delete(k);
      else p.set(k, v);
    });
    p.delete("page");
    const s = p.toString();
    router.push(`/a/finansial${s ? `?${s}` : ""}`);
  }

  const STATUS_OPTIONS = [
    { label: "Semua", value: "" },
    { label: "Belum Bayar", value: "unpaid" },
    { label: "Sebagian", value: "partial" },
    { label: "Lunas", value: "paid" },
  ];

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <span className="text-sm text-muted-foreground">Filter:</span>

      {/* Status pills */}
      {STATUS_OPTIONS.map(({ label, value }) => (
        <button
          key={value}
          type="button"
          onClick={() => push({ status: value || undefined })}
          className={cn(
            "h-8 px-3 rounded-full text-sm font-medium transition-colors",
            statusFilter === value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {label}
        </button>
      ))}

      {/* Period select */}
      {uniquePeriods.length > 0 && (
        <select
          value={periodFilter}
          onChange={(e) => push({ period: e.target.value || undefined })}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Semua Periode</option>
          {uniquePeriods.map((p) => (
            <option key={p} value={p}>{formatPeriod(p)}</option>
          ))}
        </select>
      )}
    </div>
  );
}
