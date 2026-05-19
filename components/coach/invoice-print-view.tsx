"use client";

import { useRef } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface InvoiceItem {
  id: string;
  session_date: string;
  class_name: string;
  rate_per_session: number;
  notes: string | null;
}

interface InvoiceData {
  id: string;
  period_month: string;
  total_sessions: number;
  total_amount: number;
  status: "draft" | "submitted";
  generated_at: string;
  coach_name: string;
  coach_phone: string | null;
  coach_alamat: string | null;
  coach_rekening: string | null;
  coach_bank: string | null;
  branch_name: string;
  items: InvoiceItem[];
}

interface Props {
  invoice: InvoiceData;
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  });
}

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function InvoicePrintView({ invoice }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const [y, m] = invoice.period_month.split("-").map(Number);
  const periodLabel = new Date(y, m - 1).toLocaleDateString("id-ID", {
    month: "long", year: "numeric",
  });

  function handlePrint() {
    const content = printRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invoice — ${invoice.coach_name} — ${periodLabel}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #111; padding: 40px; }
          h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
          h2 { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #555; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; border-bottom: 2px solid #111; padding-bottom: 16px; }
          .header-left h1 { font-size: 20px; }
          .header-right { text-align: right; font-size: 12px; color: #555; }
          .header-right .period { font-size: 16px; font-weight: 700; color: #111; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
          .info-block { background: #f8f8f8; border-radius: 8px; padding: 12px; }
          .info-block dt { font-size: 11px; color: #777; text-transform: uppercase; letter-spacing: 0.05em; }
          .info-block dd { font-weight: 600; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          thead th { background: #f0f0f0; padding: 8px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #555; }
          thead th:last-child { text-align: right; }
          tbody td { padding: 8px 12px; border-bottom: 1px solid #eee; }
          tbody td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
          tbody tr:hover { background: #fafafa; }
          tfoot td { padding: 10px 12px; font-weight: 700; border-top: 2px solid #111; }
          tfoot td:last-child { text-align: right; font-size: 15px; }
          .footer { margin-top: 32px; font-size: 11px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 12px; }
          @media print {
            body { padding: 20px; }
            @page { margin: 1.5cm; }
          }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }

  return (
    <div className="space-y-4">
      {/* Print button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
          <Printer className="h-4 w-4" />
          Cetak / Simpan PDF
        </Button>
      </div>

      {/* Preview card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Print content */}
        <div ref={printRef} className="p-6 space-y-5">
          {/* Header */}
          <div className="header flex items-start justify-between border-b pb-4">
            <div>
              <h1 className="text-xl font-bold">INVOICE HONORARIUM</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Next Swimming School</p>
            </div>
            <div className="text-right">
              <p className="period text-lg font-bold">{periodLabel}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cabang {invoice.branch_name}
              </p>
              <Badge
                variant={invoice.status === "submitted" ? "default" : "outline"}
                className="text-xs mt-1"
              >
                {invoice.status === "submitted" ? "Diajukan" : "Draft"}
              </Badge>
            </div>
          </div>

          {/* Info */}
          <div className="info-grid grid grid-cols-2 gap-3 text-sm">
            <div className="info-block rounded-lg bg-muted/30 p-3">
              <dl className="space-y-1.5">
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">Nama Pelatih</dt>
                  <dd className="font-semibold">{invoice.coach_name}</dd>
                </div>
                {invoice.coach_phone && (
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wide">Telepon</dt>
                    <dd>{invoice.coach_phone}</dd>
                  </div>
                )}
                {invoice.coach_alamat && (
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wide">Alamat</dt>
                    <dd>{invoice.coach_alamat}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div className="info-block rounded-lg bg-muted/30 p-3">
              <dl className="space-y-1.5">
                {invoice.coach_rekening && (
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wide">No. Rekening</dt>
                    <dd className="font-semibold font-mono">{invoice.coach_rekening}</dd>
                  </div>
                )}
                {invoice.coach_bank && (
                  <div>
                    <dt className="text-xs text-muted-foreground uppercase tracking-wide">Bank</dt>
                    <dd>{invoice.coach_bank}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-muted-foreground uppercase tracking-wide">Tanggal Generate</dt>
                  <dd>{new Date(invoice.generated_at).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                  })}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border rounded-lg overflow-hidden">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">#</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">Tanggal</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">Hari</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">Kelas</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">Tarif/Sesi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.items.map((item, idx) => {
                  const dow = new Date(item.session_date + "T00:00:00").getDay();
                  return (
                    <tr key={item.id} className="hover:bg-muted/10">
                      <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(item.session_date + "T00:00:00").toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{DAYS[dow]}</td>
                      <td className="px-3 py-2 font-medium">{item.class_name}</td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatRupiah(item.rate_per_session)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t bg-muted/20">
                <tr>
                  <td colSpan={4} className="px-3 py-3 font-bold">
                    Total ({invoice.total_sessions} sesi)
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-base tabular-nums">
                    {formatRupiah(invoice.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer */}
          <p className="footer text-xs text-muted-foreground text-center border-t pt-3">
            Invoice ini digenerate otomatis oleh sistem Next Swimming School.
            Digenerate pada {formatDate(invoice.generated_at)}.
          </p>
        </div>
      </div>
    </div>
  );
}
