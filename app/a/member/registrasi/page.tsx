import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ClockIcon, User, Phone, CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ApprovalActions } from "./approval-actions";

interface PendingMember {
  id: string;
  member_id_code: string;
  branch_id: string;
  type: string;
  created_at: string;
  branches: { name: string } | null;
  member_profiles: {
    full_name: string;
    dob: string | null;
    phone: string | null;
    phone_owner: string;
    parent_name: string | null;
    parent_phone: string | null;
    address: string | null;
    health_history: string | null;
    gender: string;
  } | null;
}

function ageFromDob(dob: string | null): string {
  if (!dob) return "—";
  const diff = Date.now() - new Date(dob).getTime();
  return `${Math.floor(diff / (365.25 * 24 * 3600 * 1000))} tahun`;
}

function RegistrasiSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-4 animate-pulse">
      <div className="h-7 w-48 bg-muted rounded" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border overflow-hidden">
            <div className="h-16 bg-muted border-b" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-2/3 bg-muted rounded" />
              <div className="h-5 w-1/2 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function RegistrasiPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <Suspense fallback={<RegistrasiSkeleton />}>
      <RegistrasiContent />
    </Suspense>
  );
}

async function RegistrasiContent() {
  const supabase = createClient(await cookies());

  const { data: rawMembers, error } = await supabase
    .from("members")
    .select(
      `id, member_id_code, branch_id, type, created_at,
       branches(name),
       member_profiles(full_name, dob, phone, phone_owner, parent_name, parent_phone, address, health_history, gender)`
    )
    .eq("status", "pending_payment")
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div className="p-6">
        <p className="text-destructive">Gagal memuat data: {error.message}</p>
      </div>
    );
  }

  // Normalize nested objects from Supabase arrays
  const members: PendingMember[] = (rawMembers ?? []).map((m) => ({
    ...m,
    branches: Array.isArray(m.branches) ? m.branches[0] ?? null : m.branches,
    member_profiles: Array.isArray(m.member_profiles)
      ? m.member_profiles[0] ?? null
      : m.member_profiles,
  }));

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Pendaftaran Masuk</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {members.length} pendaftar menunggu persetujuan
        </p>
      </div>

      {members.length === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-16 text-center text-muted-foreground">
          <ClockIcon className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Tidak ada pendaftar yang menunggu</p>
          <p className="text-sm mt-1">Semua pendaftaran sudah diproses.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((m) => {
            const p = m.member_profiles;
            const waPhone = p?.phone?.replace(/\D/g, "");
            const waParentPhone = p?.parent_phone?.replace(/\D/g, "");

            return (
              <div
                key={m.id}
                className="rounded-lg border bg-card overflow-hidden"
              >
                {/* Card header */}
                <div className="flex items-start justify-between px-4 md:px-6 pt-4 pb-3 border-b">
                  <div>
                    <p className="font-semibold text-base">
                      {p?.full_name ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {m.member_id_code}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 mt-0.5">
                    Menunggu Bayar
                  </Badge>
                </div>

                {/* Card body */}
                <div className="px-4 md:px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  {/* Umur + Gender */}
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Peserta</p>
                      <p>
                        {p?.gender === "male" ? "Laki-laki" : p?.gender === "female" ? "Perempuan" : "—"}
                        {" · "}
                        {ageFromDob(p?.dob ?? null)}
                      </p>
                    </div>
                  </div>

                  {/* Telepon */}
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        No. HP ({p?.phone_owner === "parent" ? "Orang Tua" : "Sendiri"})
                      </p>
                      {p?.phone ? (
                        <a
                          href={`https://wa.me/${waPhone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {p.phone}
                        </a>
                      ) : (
                        <p>—</p>
                      )}
                    </div>
                  </div>

                  {/* Cabang */}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Cabang</p>
                      <p>{m.branches?.name ?? "—"}</p>
                    </div>
                  </div>

                  {/* Tanggal daftar */}
                  <div className="flex items-start gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Tanggal Daftar</p>
                      <p>
                        {new Date(m.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Orang Tua (jika ada) */}
                  {p?.parent_name && (
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <User className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Orang Tua / Wali</p>
                        <p>
                          {p.parent_name}
                          {p.parent_phone && (
                            <> · <a
                              href={`https://wa.me/${waParentPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {p.parent_phone}
                            </a></>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Riwayat kesehatan */}
                  {p?.health_history && (
                    <div className="sm:col-span-2">
                      <p className="text-xs text-muted-foreground mb-0.5">Riwayat Kesehatan</p>
                      <p className="text-sm bg-amber-50 border border-amber-200 rounded px-2 py-1 text-amber-800">
                        {p.health_history}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <ApprovalActions
                  memberId={m.id}
                  branchId={m.branch_id}
                  memberPhone={p?.phone ?? null}
                  memberName={p?.full_name ?? ""}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
