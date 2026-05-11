import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";

export default async function CabangPage() {
  const supabase = createClient(await cookies());
  const { data: roleData } = await supabase.rpc("user_role");
  if (roleData !== "owner") redirect("/a/dashboard");

  const { data: branches } = await supabase
    .from("branches")
    .select("id, name, slug, address, status, is_default")
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
            <div key={b.id} className="rounded-xl border bg-card px-5 py-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{b.name}</p>
                  {b.is_default && (
                    <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">Utama</span>
                  )}
                </div>
                {b.address && (
                  <p className="text-sm text-muted-foreground mt-0.5">{b.address}</p>
                )}
              </div>
              <span className={`text-xs rounded-full px-2.5 py-1 ${
                b.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-muted text-muted-foreground"
              }`}>
                {b.status === "active" ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-dashed px-4 py-3 text-center text-xs text-muted-foreground">
        Penambahan cabang baru akan segera tersedia.
      </div>
    </div>
  );
}
