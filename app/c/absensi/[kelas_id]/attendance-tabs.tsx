"use client";

import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { Scanner as QrScanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { recordAttendanceByQr, recordAttendanceManual } from "@/lib/actions/class";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  memberCode: string;
  fullName: string;
  existingStatus: string | null;
}

interface Props {
  classId: string;
  sessionDate: string;
  classStartTime: string | null;
  members: Member[];
  initialRecords: { member_id: string; status: string }[];
  isOffSchedule: boolean;
  scheduledDays: number[];
}

const STATUS_OPTIONS = [
  { value: "present", label: "Hadir" },
  { value: "late", label: "Terlambat" },
  { value: "permitted", label: "Izin" },
  { value: "sick", label: "Sakit" },
  { value: "absent", label: "Alpha" },
] as const;

type AttendanceStatus = (typeof STATUS_OPTIONS)[number]["value"];

const STATUS_BADGE: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  present: "default",
  late: "secondary",
  permitted: "outline",
  sick: "outline",
  absent: "destructive",
};

const STATUS_LABEL: Record<string, string> = {
  present: "Hadir",
  late: "Terlambat",
  permitted: "Izin",
  sick: "Sakit",
  absent: "Alpha",
};

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

const OFF_SCHEDULE_REASONS = [
  { value: "reschedule", label: "Reschedule / Ganti Hari" },
  { value: "makeup", label: "Makeup Class / Kelas Pengganti" },
  { value: "extra", label: "Kelas Tambahan" },
];

const REASON_NOTE_PREFIX: Record<string, string> = {
  reschedule: "[Reschedule]",
  makeup: "[Makeup Class]",
  extra: "[Kelas Tambahan]",
};

export function AttendanceTabs({
  classId,
  sessionDate,
  members,
  initialRecords,
  isOffSchedule,
  scheduledDays,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // Off-schedule state
  const [offScheduleReason, setOffScheduleReason] = useState<string | null>(null);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [selectedReason, setSelectedReason] = useState("reschedule");

  // Local attendance state (memberId → status)
  const [attendance, setAttendance] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialRecords.forEach((r) => { map[r.member_id] = r.status; });
    return map;
  });

  const presentCount = Object.values(attendance).filter(
    (s) => s === "present" || s === "late"
  ).length;

  // ── Off-schedule helpers ──────────────────────────────────────────────────────
  function getNotes(): string | undefined {
    if (!isOffSchedule || !offScheduleReason) return undefined;
    return REASON_NOTE_PREFIX[offScheduleReason] ?? undefined;
  }

  function handleConfirmReason() {
    setOffScheduleReason(selectedReason);
    setShowReasonDialog(false);
    pendingAction?.();
    setPendingAction(null);
  }

  function handleCloseDialog() {
    setShowReasonDialog(false);
    setPendingAction(null);
  }

  // ── QR Scan handler ──────────────────────────────────────────────────────────
  function doScan(result: string) {
    setLastScanned(result);
    setTimeout(() => setLastScanned(null), 3_000);

    startTransition(async () => {
      const res = await recordAttendanceByQr(result, classId, sessionDate, getNotes());
      if (res.error === "DUPLICATE") {
        toast.info("Sudah tercatat hadir");
        return;
      }
      if (res.error) {
        toast.error(res.error);
        return;
      }
      const { memberName, status } = res.data!;
      setAttendance((prev) => ({ ...prev, [result]: status }));
      toast.success(
        status === "late"
          ? `⚠ ${memberName} hadir (terlambat)`
          : `✓ ${memberName} hadir`
      );
    });
  }

  const handleScan = useCallback((results: IDetectedBarcode[]) => {
    const result = results[0]?.rawValue;
    if (!result) return;
    if (isPending || result === lastScanned) return;

    if (isOffSchedule && !offScheduleReason) {
      setPendingAction(() => () => doScan(result));
      setShowReasonDialog(true);
      return;
    }
    doScan(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, sessionDate, isPending, lastScanned, isOffSchedule, offScheduleReason]);

  // ── Manual status change ─────────────────────────────────────────────────────
  function doManual(memberId: string, status: AttendanceStatus) {
    startTransition(async () => {
      const res = await recordAttendanceManual(memberId, classId, sessionDate, status, getNotes());
      if (res.error) { toast.error(res.error); return; }
      setAttendance((prev) => ({ ...prev, [memberId]: status }));
    });
  }

  function handleManual(memberId: string, status: AttendanceStatus) {
    if (isOffSchedule && !offScheduleReason) {
      setPendingAction(() => () => doManual(memberId, status));
      setShowReasonDialog(true);
      return;
    }
    doManual(memberId, status);
  }

  return (
    <>
      {/* Off-schedule warning banner */}
      {isOffSchedule && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
          <p className="font-medium">⚠ Kelas ini tidak terjadwal hari ini</p>
          <p className="text-xs mt-0.5">
            Jadwal normal:{" "}
            {scheduledDays.length > 0
              ? scheduledDays.sort((a, b) => a - b).map((d) => DAYS[d]).join(", ")
              : "Tidak ada jadwal"}
          </p>
          {offScheduleReason && (
            <p className="text-xs mt-1 font-semibold">
              Alasan sesi ini: {OFF_SCHEDULE_REASONS.find((r) => r.value === offScheduleReason)?.label}
            </p>
          )}
        </div>
      )}

      <Tabs defaultValue="scan">
        <TabsList variant="line">
          <TabsTrigger value="scan">Scan QR</TabsTrigger>
          <TabsTrigger value="manual">
            Manual
            <span className="ml-1 text-xs opacity-60">({presentCount}/{members.length})</span>
          </TabsTrigger>
        </TabsList>

        {/* ── Tab Scan QR ──────────────────────────────────────────────────────── */}
        <TabsContent value="scan" className="mt-4 space-y-3">
          <p className="text-sm text-muted-foreground text-center">
            Arahkan kamera ke QR code member untuk mencatat kehadiran.
          </p>

          {!scanning ? (
            <button
              onClick={() => setScanning(true)}
              className="w-full rounded-xl border-2 border-dashed border-muted-foreground/30 py-12 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              Ketuk untuk buka kamera
            </button>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border w-full">
                <QrScanner
                  onScan={handleScan}
                  constraints={{ facingMode: "environment" }}
                />
              </div>
              <button
                onClick={() => setScanning(false)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                Tutup kamera
              </button>
            </div>
          )}

          {/* Recent scans summary */}
          <div className="space-y-1">
            {members
              .filter((m) => attendance[m.id])
              .slice(0, 5)
              .map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm px-1">
                  <span className="truncate">{m.fullName}</span>
                  <Badge variant={STATUS_BADGE[attendance[m.id]] ?? "outline"} className="shrink-0 ml-2">
                    {STATUS_LABEL[attendance[m.id]] ?? attendance[m.id]}
                  </Badge>
                </div>
              ))}
          </div>
        </TabsContent>

        {/* ── Tab Manual Checklist ─────────────────────────────────────────────── */}
        <TabsContent value="manual" className="mt-4">
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Belum ada anggota terdaftar di kelas ini.
            </p>
          ) : (
            <ul className="space-y-2">
              {members.map((m) => {
                const currentStatus = attendance[m.id] ?? null;
                return (
                  <li
                    key={m.id}
                    className="rounded-xl border px-4 py-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{m.fullName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{m.memberCode}</p>
                      </div>
                      {currentStatus && (
                        <Badge variant={STATUS_BADGE[currentStatus] ?? "outline"} className="shrink-0 ml-2">
                          {STATUS_LABEL[currentStatus] ?? currentStatus}
                        </Badge>
                      )}
                    </div>
                    {/* Status buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          disabled={isPending}
                          onClick={() => handleManual(m.id, opt.value)}
                          className={cn(
                            "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors",
                            currentStatus === opt.value
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      {/* Off-schedule reason dialog */}
      <Dialog
        open={showReasonDialog}
        onOpenChange={(open) => { if (!open) handleCloseDialog(); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Sesi di Luar Jadwal</DialogTitle>
            <DialogDescription>
              Kelas ini tidak terjadwal hari ini. Pilih alasan untuk melanjutkan absensi. Alasan akan dicatat pada data absensi.
            </DialogDescription>
          </DialogHeader>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {OFF_SCHEDULE_REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Batal
            </Button>
            <Button onClick={handleConfirmReason}>
              Lanjut Absensi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
