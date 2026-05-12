import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, ChevronRight, MapPin } from "lucide-react";

export default async function CabangPage() {
  const supabase = createClient(await cookies());
  const { data: roleData } = await supabase.rpc("user_role");
  if (roleData !== "owner") redirect("/a/dashboard");

  const { data: branches } = await supabase
    .from("branches")
    .select("id, name, slug, address, status, is_default, location_lat, location_lng")
    .is("deleted_at", null)
    .order("is_default", { ascending: false });

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Cabang</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Daftar semua cabang Next Swimming School.
        </p>
      </div>

      {(branches ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center text-muted-foreground text-sm flex flex-col items-center gap-3">
          <Building2 className="h-10 w-10 opacity-30" />
          <p>Belum ada cabang.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(branches ?? []).map((b) => (
            <Link
              key={b.id}
              href={`/a/cabang/${b.id}`}
              className="rounded-xl border bg-card px-5 py-4 flex items-start justify-between gap-4 hover:bg-muted/40 transition-colors block"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">{b.name}</p>
                  {b.is_default && (
                    <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">Utama</span>
                  )}
                  <span className={`text-xs rounded-full px-2.5 py-1 ${
                    b.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {b.status === "active" ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                {b.address && (
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">{b.address}</p>
                )}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  {b.location_lat && b.location_lng ? (
                    <span className="text-xs text-muted-foreground font-mono">
                      {b.location_lat.toFixed(5)}, {b.location_lng.toFixed(5)}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-600">Koordinat belum diset</span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-dashed px-4 py-3 text-center text-xs text-muted-foreground">
        Penambahan cabang baru akan segera tersedia.
      </div>
    </div>
  );
}
