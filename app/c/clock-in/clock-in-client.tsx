"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MapPin, CheckCircle2, AlertTriangle, Loader2, Clock } from "lucide-react";
import { clockIn } from "@/lib/actions/coach";
import { CameraCapture } from "@/components/coach/camera-capture";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  branchId: string;
  branchName: string;
  branchLat: number | null;
  branchLng: number | null;
  existingRecord: {
    clockInAt: string;
    distanceM: number | null;
  } | null;
}

type GpsState = "idle" | "loading" | "ok" | "error";

export function ClockInClient({
  branchId,
  branchName,
  branchLat,
  branchLng,
  existingRecord,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selfie, setSelfie] = useState<string | null>(null);
  const [gpsState, setGpsState] = useState<GpsState>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [distanceM, setDistanceM] = useState<number | null>(null);

  const requestGps = useCallback(() => {
    setGpsState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setGpsState("ok");
      },
      () => {
        setGpsState("error");
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    );
  }, []);

  // Already clocked in — show result
  if (existingRecord) {
    const time = new Date(existingRecord.clockInAt).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      <div className="p-4 max-w-sm mx-auto space-y-4 pt-6">
        <div className="text-center space-y-2">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-xl font-semibold">Sudah Absen Masuk</h1>
          <p className="text-muted-foreground text-sm">
            Kamu sudah absen hari ini di {branchName}
          </p>
        </div>
        <Card>
          <CardContent className="pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Waktu</span>
              <span className="font-medium">{time}</span>
            </div>
            {existingRecord.distanceM != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jarak dari lokasi</span>
                <span className={cn(
                  "font-medium",
                  existingRecord.distanceM <= 200 ? "text-green-600" : "text-amber-600"
                )}>
                  {existingRecord.distanceM}m
                </span>
              </div>
            )}
          </CardContent>
        </Card>
        <Button variant="outline" className="w-full" onClick={() => router.push("/c/dashboard")}>
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  // Preview distance when GPS ok and branch coords known
  const previewDistance =
    coords && branchLat != null && branchLng != null
      ? (() => {
          const R = 6_371_000;
          const toRad = (d: number) => (d * Math.PI) / 180;
          const dLat = toRad(branchLat - coords.lat);
          const dLng = toRad(branchLng - coords.lng);
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(coords.lat)) * Math.cos(toRad(branchLat)) * Math.sin(dLng / 2) ** 2;
          return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
        })()
      : null;

  const canSubmit = selfie && gpsState === "ok" && coords;

  function handleSubmit() {
    if (!canSubmit || !coords) return;
    startTransition(async () => {
      const result = await clockIn({
        selfieBase64: selfie!,
        lat: coords.lat,
        lng: coords.lng,
        accuracy: coords.accuracy,
        branchId,
        branchLat,
        branchLng,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setDistanceM(result.data?.distanceM ?? null);
      toast.success("Absen masuk berhasil!");
      router.refresh();
    });
  }

  // Success state after submit
  if (distanceM !== null) {
    return (
      <div className="p-4 max-w-sm mx-auto space-y-4 pt-6 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h1 className="text-xl font-semibold">Absen Berhasil!</h1>
        <p className="text-muted-foreground text-sm">
          {distanceM <= 200
            ? `✓ Di lokasi (${distanceM}m dari ${branchName})`
            : `⚠ Jauh dari lokasi (${distanceM}m dari ${branchName})`}
        </p>
        <Button className="w-full" onClick={() => router.push("/c/dashboard")}>
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-sm mx-auto space-y-4">
      <div className="pt-2">
        <h1 className="text-xl font-semibold">Absen Masuk</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{branchName}</p>
      </div>

      {/* Step 1: Selfie */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
            Foto Selfie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CameraCapture
            captured={selfie}
            onCapture={setSelfie}
            onClear={() => setSelfie(null)}
          />
        </CardContent>
      </Card>

      {/* Step 2: GPS */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
            Lokasi GPS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {gpsState === "idle" && (
            <Button variant="outline" className="w-full" onClick={requestGps}>
              <MapPin className="h-4 w-4 mr-2" />
              Dapatkan Lokasi
            </Button>
          )}
          {gpsState === "loading" && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Mendapatkan lokasi...
            </div>
          )}
          {gpsState === "ok" && coords && (
            <div className="space-y-2">
              <div className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                previewDistance == null
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                  : previewDistance <= 200
                  ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
              )}>
                {previewDistance == null ? (
                  <><MapPin className="h-4 w-4" /> Lokasi didapatkan</>
                ) : previewDistance <= 200 ? (
                  <><CheckCircle2 className="h-4 w-4" /> Di lokasi ({previewDistance}m)</>
                ) : (
                  <><AlertTriangle className="h-4 w-4" /> Jauh dari lokasi ({previewDistance}m)</>
                )}
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Akurasi: ±{Math.round(coords.accuracy)}m
              </p>
              <Button variant="outline" size="sm" className="w-full" onClick={requestGps}>
                <MapPin className="h-3 w-3 mr-1" /> Perbarui Lokasi
              </Button>
            </div>
          )}
          {gpsState === "error" && (
            <div className="space-y-2">
              <p className="text-sm text-destructive text-center">
                Gagal mendapatkan lokasi. Pastikan GPS aktif.
              </p>
              <Button variant="outline" className="w-full" onClick={requestGps}>
                Coba Lagi
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        className="w-full"
        disabled={!canSubmit || isPending}
        onClick={handleSubmit}
      >
        {isPending ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Menyimpan...</>
        ) : (
          <><Clock className="h-4 w-4 mr-2" /> Absen Masuk Sekarang</>
        )}
      </Button>

      {!selfie && (
        <p className="text-xs text-center text-muted-foreground">
          Lengkapi foto selfie dan lokasi GPS untuk melanjutkan.
        </p>
      )}
    </div>
  );
}
