"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { generateCoachInvoice } from "@/lib/actions/coach-invoice";
import type { CoachSessionRow } from "@/lib/types/coach-invoice";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckSquare, Square, RefreshCw, FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  sessions: CoachSessionRow[];
  periodMonth: string;
  existingInvoice: {
    id: string;
    total_sessions: number;
    total_amount: number;
    status: string;
    generated_at: string;
  } | null;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
  });
}

const STATUS_LABEL: Record<string, string> = {
  hadir: "Hadir",
  izin: "Izin",
  pengganti: "Pengganti",
};
const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  hadir: "default",
  izin: "destructive",
  pengganti: "secondary",
};

export function InvoiceSessionTable({ sessions, periodMonth, existingInvoice }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const eligibleKeys = new Set(
    sessions.filter((s) => s.eligible).map((s) => `${s.class_id}|${s.session_date}`)
  );

  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSession(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(eligibleKeys));
  }

  function clearAll() {
    setSelected(new Set());
  }

  const selectedSessions = sessions.filter((s) =>
    selected.has(`${s.class_id}|${s.session_date}`)
  );

  const totalEstimasi = selectedSessions.reduce((s, r) => s + r.rate_per_session, 0);
  const hasRateZero = selectedSessions.some((s) => s.rate_per_session === 0);

  function doGenerate() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("period_month", periodMonth);
      formData.set(
        "selected_sessions",
        JSON.stringify(
          selectedSessions.map((s) => ({
            class_id: s.class_id,
            session_date: s.session_date,
            rate_per_session: s.rate_per_session,
          }))
        )
      );

      const result = await generateCoachInvoice(formData);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Invoice berhasil digenerate!");
      router.refresh();
    });
  }

  const [year, month] = periodMonth.split("-");
  const periodLabel = new Date(Number(year), Number(month) - 1).toLocaleDateString("id-ID", {
    month: "long", year: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Existing invoice banner */}
      {existingInvoice && (
        <div className="rounded-xl border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 px-4 py-3 flex items-start gap-3">
          <FileText className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Invoice {periodLabel} sudah pernah digenerate
            </p>
            <p className="text-xs text-amber-600/80 mt-0.5">
              {existingInvoice.total_sessions} sesi · {formatRupiah(existingInvoice.total_amount)} ·
              Status: <span className="font-medium capitalize">{existingInvoice.status}</span> ·
              Terakhir: {formatDate(existingInvoice.generated_at)}
            </p>
            <p className="text-xs text-amber-600/70 mt-1">
              Generate ulang akan menggantikan invoice sebelumnya.
            </p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={selected.size === eligibleKeys.size ? clearAll : selectAll}
            className="gap-1.5"
          >
            {selected.size === eligibleKeys.size && eligibleKeys.size > 0 ? (
              <><CheckSquare className="h-3.5 w-3.5" /> Batalkan Semua</>
            ) : (
              <><Square className="h-3.5 w-3.5" /> Pilih Semua ({eligibleKeys.size})</>
            )}
          </Button>
          {selected.size > 0 && (
            <span className="text-sm text-muted-foreground">
              {selected.size} sesi dipilih · Estimasi {formatRupiah(totalEstimasi)}
            </span>
          )}
        </div>

        {existingInvoice ? (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button size="sm" disabled={isPending || selected.size === 0} className="gap-1.5" />
              }
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {isPending ? "Memproses..." : "Generate Ulang"}
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Generate Ulang Invoice?</AlertDialogTitle>
                <AlertDialogDescription>
                  Invoice {periodLabel} yang sudah ada akan digantikan dengan yang baru ({selected.size} sesi, {formatRupiah(totalEstimasi)}).
                  {hasRateZero && (
                    <span className="block mt-2 text-amber-600 font-medium">
                      ⚠️ Ada sesi dengan tarif Rp 0. Pastikan tarif sudah dikonfigurasi.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={doGenerate}>Ya, Generate Ulang</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            size="sm"
            disabled={isPending || selected.size === 0}
            onClick={() => {
              if (hasRateZero) {
                if (!confirm(`Ada ${selectedSessions.filter((s) => s.rate_per_session === 0).length} sesi dengan tarif Rp 0. Lanjutkan?`)) return;
              }
              doGenerate();
            }}
            className="gap-1.5"
          >
            <FileText className="h-3.5 w-3.5" />
            {isPending ? "Memproses..." : `Generate Invoice (${selected.size})`}
          </Button>
        )}
      </div>

      {/* Table */}
      {sessions.length === 0 ? (
        <div className="rounded-xl border px-4 py-12 text-center text-sm text-muted-foreground">
          Tidak ada jadwal kelas di bulan ini.
        </div>
      ) : (
        <div className="rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="w-10 px-4 py-2.5" />
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Tanggal</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Hari</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Kelas</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Tarif</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sessions.map((s) => {
                const key = `${s.class_id}|${s.session_date}`;
                const isSelected = selected.has(key);
                return (
                  <tr
                    key={key}
                    className={cn(
                      "transition-colors",
                      s.eligible
                        ? "cursor-pointer hover:bg-muted/20"
                        : "opacity-50 cursor-not-allowed",
                      isSelected && "bg-primary/5"
                    )}
                    onClick={() => s.eligible && toggleSession(key)}
                    title={s.ineligible_reason}
                  >
                    <td className="px-4 py-3">
                      {s.eligible ? (
                        isSelected ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground" />
                        )
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground/30" />
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(s.session_date)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.day_name}</td>
                    <td className="px-4 py-3 font-medium">{s.class_name}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[s.status] ?? "outline"} className="text-xs">
                        {STATUS_LABEL[s.status] ?? s.status}
                      </Badge>
                    </td>
                    <td className={cn(
                      "px-4 py-3 text-right tabular-nums",
                      s.rate_per_session === 0 ? "text-destructive" : ""
                    )}>
                      {s.rate_per_session === 0 ? (
                        <span className="text-xs text-destructive">Belum dikonfigurasi</span>
                      ) : (
                        formatRupiah(s.rate_per_session)
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {selectedSessions.length > 0 && (
              <tfoot className="border-t bg-muted/20">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-sm font-semibold">
                    Total ({selected.size} sesi)
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold tabular-nums">
                    {formatRupiah(totalEstimasi)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
