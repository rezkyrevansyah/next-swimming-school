"use client";

import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { QrScanner } from "@yudiel/react-qr-scanner";
import { recordAttendanceByQr, recordAttendanceManual } from "@/lib/actions/class";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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

export function AttendanceTabs({
  classId,
  sessionDate,
  members,
  initialRecords,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [scanning, setScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);

  // Local attendance state (memberId → status)
  const [attendance, setAttendance] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialRecords.forEach((r) => { map[r.member_id] = r.status; });
    return map;
  });

  const presentCount = Object.values(attendance).filter(
    (s) => s === "present" || s === "late"
  ).length;

  // ── QR Scan handler ──────────────────────────────────────────────────────────
  const handleScan = useCallback((result: string) => {
    if (isPending || result === lastScanned) return;
    setLastScanned(result);
    // Reset lastScanned after 3s to allow re-scan
    setTimeout(() => setLastScanned(null), 3_000);

    startTransition(async () => {
      const res = await recordAttendanceByQr(result, classId, sessionDate);
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
  }, [classId, sessionDate, isPending, lastScanned]);

  // ── Manual status change ─────────────────────────────────────────────────────
  function handleManual(memberId: string, status: AttendanceStatus) {
    startTransition(async () => {
      const res = await recordAttendanceManual(memberId, classId, sessionDate, status);
      if (res.error) { toast.error(res.error); return; }
      setAttendance((prev) => ({ ...prev, [memberId]: status }));
    });
  }

  return (
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
            <div className="rounded-xl overflow-hidden border">
              <QrScanner
                onDecode={handleScan}
                onError={() => {}}
                constraints={{ facingMode: "environment" }}
                containerStyle={{ width: "100%", paddingTop: "100%" }}
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
  );
}
