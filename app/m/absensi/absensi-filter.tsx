"use client";

import { useRouter } from "next/navigation";

interface AbsensiFilterProps {
  bulan: string;
  kelasFilter: string;
  monthOptions: { val: string; label: string }[];
  classes: { id: string; name: string }[];
}

export function AbsensiFilter({ bulan, kelasFilter, monthOptions, classes }: AbsensiFilterProps) {
  const router = useRouter();

  function handleBulan(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams();
    params.set("bulan", e.target.value);
    if (kelasFilter) params.set("kelas", kelasFilter);
    router.push(`/m/absensi?${params.toString()}`);
  }

  function handleKelas(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams();
    params.set("bulan", bulan);
    if (e.target.value) params.set("kelas", e.target.value);
    router.push(`/m/absensi?${params.toString()}`);
  }

  return (
    <div className="flex gap-2">
      <select
        value={bulan}
        className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm"
        onChange={handleBulan}
      >
        {monthOptions.map((m) => (
          <option key={m.val} value={m.val}>{m.label}</option>
        ))}
      </select>
      {classes.length > 1 && (
        <select
          value={kelasFilter}
          className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm"
          onChange={handleKelas}
        >
          <option value="">Semua Kelas</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}
