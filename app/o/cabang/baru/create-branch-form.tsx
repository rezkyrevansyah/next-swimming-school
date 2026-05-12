"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Loader2, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBranch } from "@/lib/actions/branch";

const inputCls =
  "w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

export function CreateBranchForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  function handleGetLocation() {
    setGpsError(null);
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(7));
        setLng(pos.coords.longitude.toFixed(7));
        setGpsLoading(false);
      },
      (err) => {
        setGpsError("Tidak dapat mengambil lokasi: " + err.message);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createBranch(formData);
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/o/cabang");
      }
    });
  }

  const mapsUrl = lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">
          Nama Cabang <span className="text-destructive">*</span>
        </label>
        <input name="name" required placeholder="Contoh: Next Swimming School Depok" className={inputCls} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Alamat</label>
        <textarea
          name="address"
          rows={2}
          placeholder="Jl. Contoh No. 1, Kota..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">No. Telepon</label>
          <input name="contact_phone" placeholder="08xx" className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <input name="contact_email" type="email" placeholder="cabang@example.com" className={inputCls} />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Koordinat Lokasi</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleGetLocation}
            disabled={gpsLoading}
            className="gap-1.5"
          >
            {gpsLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LocateFixed className="h-3.5 w-3.5" />
            )}
            Gunakan Lokasi Saya
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Digunakan untuk menghitung jarak saat pelatih clock-in. Bisa diisi nanti.
        </p>
        {gpsError && <p className="text-xs text-destructive">{gpsError}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Latitude</label>
            <input
              name="location_lat"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              placeholder="-6.2088"
              className={inputCls}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Longitude</label>
            <input
              name="location_lng"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
              placeholder="106.8456"
              className={inputCls}
            />
          </div>
        </div>
        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-sky-600 hover:underline"
          >
            <MapPin className="h-3 w-3" />
            Lihat di Google Maps
          </a>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Status</label>
        <select name="status" defaultValue="active" className={inputCls}>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Buat Cabang
        </Button>
      </div>
    </form>
  );
}
