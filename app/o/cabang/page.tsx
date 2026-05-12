import { createAdminClient } from "@/utils/supabase/server";
import Link from "next/link";
import { Building2, MapPin, ArrowRight, Plus } from "lucide-react";
import { setActiveBranch } from "@/lib/actions/branch";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function OwnerCabangPage() {
  const db = createAdminClient();

  const { data: branches } = await db
    .from("branches")
    .select("id, name, address, status, is_default, location_lat, location_lng, contact_phone")
    .is("deleted_at", null)
    .order("is_default", { ascending: false });

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Cabang</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {branches?.length ?? 0} cabang terdaftar
          </p>
        </div>
        <Link href="/o/cabang/baru" className={cn(buttonVariants({ size: "sm" }), "gap-2")}>
          <Plus className="h-4 w-4" />
          Cabang Baru
        </Link>
      </div>

      {(branches ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground flex flex-col items-center gap-3">
          <Building2 className="h-10 w-10 opacity-30" />
          <p>Belum ada cabang.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(branches ?? []).map((b) => (
            <div key={b.id} className="rounded-xl border bg-card overflow-hidden">
              <div className="px-5 py-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium">{b.name}</p>
                    {b.is_default && (
                      <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">Utama</span>
                    )}
                    <span className={`text-xs rounded-full px-2.5 py-1 ${
                      b.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"
                    }`}>
                      {b.status === "active" ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                  {b.address && (
                    <p className="text-sm text-muted-foreground truncate">{b.address}</p>
                  )}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                    {b.location_lat && b.location_lng ? (
                      <span className="text-xs text-muted-foreground font-mono">
                        {Number(b.location_lat).toFixed(5)}, {Number(b.location_lng).toFixed(5)}
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600">Koordinat belum diset</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t flex divide-x">
                <Link
                  href={`/o/cabang/${b.id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  Edit Setting
                </Link>
                <form action={setActiveBranch} className="flex-1">
                  <input type="hidden" name="branch_id" value={b.id} />
                  <input type="hidden" name="branch_name" value={b.name} />
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
                  >
                    Kelola Cabang
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Klik <strong>Edit Setting</strong> untuk mengubah koordinat, alamat, atau kontak cabang.
        Klik <strong>Kelola Cabang</strong> untuk masuk ke panel admin cabang tersebut.
      </p>
    </div>
  );
}
