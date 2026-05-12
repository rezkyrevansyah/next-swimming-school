"use client";

import { useState, useTransition } from "react";
import { MapPin, Loader2, LocateFixed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateBranch } from "@/lib/actions/branch";

interface Branch {
  id: string;
  name: string;
  address: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  location_lat: number | null;
  location_lng: number | null;
  status: string;
}

const inputCls =
  "w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors";

export function BranchEditForm({ branch }: { branch: Branch }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [lat, setLat] = useState(branch.location_lat?.toString() ?? "");
  const [lng, setLng] = useState(branch.location_lng?.toString() ?? "");
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
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateBranch(formData);
      if (res.error) setError(res.error);
      else setSuccess(true);
    });
  }

  const mapsUrl =
    lat && lng
      ? `https://www.google.com/maps?q=${lat},${lng}`
      : null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="id" value={branch.id} />

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Nama Cabang <span className="text-destructive">*</span></label>
        <input name="name" defaultValue={branch.name} required className={inputCls} />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Alamat</label>
        <textarea
          name="address"
          defaultValue={branch.address ?? ""}
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">No. Telepon</label>
          <input name="contact_phone" defaultValue={branch.contact_phone ?? ""} className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <input name="contact_email" type="email" defaultValue={branch.contact_email ?? ""} className={inputCls} />
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
          Koordinat ini digunakan untuk menghitung jarak saat pelatih melakukan clock-in. Disarankan diisi saat berada di lokasi kolam renang.
        </p>

        {gpsError && (
          <p className="text-xs text-destructive">{gpsError}</p>
        )}

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

        {lat && lng && !mapsUrl && null}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium">Status</label>
        <select name="status" defaultValue={branch.status} className={inputCls}>
          <option value="active">Aktif</option>
          <option value="inactive">Nonaktif</option>
        </select>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Cabang berhasil diperbarui.
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Simpan Perubahan
      </Button>
    </form>
  );
}
