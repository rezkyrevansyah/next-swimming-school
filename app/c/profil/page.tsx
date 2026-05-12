import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AlertCircle, IdCard, Phone, Calendar, MapPin, Clock, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CoachQrDisplay } from "./coach-qr-display";
import { CertificateSection } from "./certificate-section";
import { EditCoachProfilForm } from "./edit-profil-form";

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}

function SimpleSkeleton() {
  return (
    <div className="p-4 space-y-3 animate-pulse">
      <div className="h-7 w-40 bg-muted rounded" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 bg-muted rounded-xl" />
      ))}
    </div>
  );
}

async function PageContent() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: coach } = await supabase
    .from("coaches")
    .select(`
      id, coach_id_code, status,
      coach_profiles(full_name, nickname, dob, gender, phone, photo_url, specializations),
      coach_branches!inner(branch_id, is_primary, branches(name)),
      coach_certificates(id, name, photo_url, issued_year, valid_until, no_expiry, approval_status, approval_notes)
    `)
    .eq("user_id", user.id)
    .eq("coach_branches.is_primary", true)
    .single();

  // Check for pending change request
  const { data: pendingRequest } = await supabase
    .from("change_requests")
    .select("id, created_at")
    .eq("requester_id", user.id)
    .eq("resource_type", "coach_profile")
    .eq("status", "pending")
    .maybeSingle();

  if (!coach) {
    return (
      <div className="p-6 text-center space-y-2">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <p className="font-medium">Profil pelatih tidak ditemukan.</p>
        <p className="text-sm text-muted-foreground">Hubungi admin untuk bantuan.</p>
      </div>
    );
  }

  const profile = (Array.isArray(coach.coach_profiles) ? coach.coach_profiles[0] : coach.coach_profiles) as {
    id: string; full_name: string; nickname: string | null; dob: string | null;
    gender: string | null; photo_url: string | null; phone: string | null;
    specializations: string[] | null;
  } | null;
  const branchEntry = Array.isArray(coach.coach_branches) ? coach.coach_branches[0] : coach.coach_branches;
  const branch = Array.isArray(branchEntry?.branches) ? branchEntry.branches[0] : branchEntry?.branches;
  const certificates = Array.isArray(coach.coach_certificates) ? coach.coach_certificates : [];

  const displayName = profile?.nickname || profile?.full_name || "Pelatih";

  return (
    <>
      <div className="pt-2">
        <h1 className="text-xl font-semibold">Profil Saya</h1>
      </div>

      {/* Profile header card */}
      <div className="rounded-xl border bg-card p-5 space-y-3">
        <div className="flex items-center gap-4">
          {profile?.photo_url ? (
            <img
              src={profile.photo_url}
              alt={displayName}
              className="h-16 w-16 rounded-full object-cover border"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground border">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-lg font-semibold truncate">{profile?.full_name ?? "—"}</p>
            {profile?.nickname && (
              <p className="text-sm text-muted-foreground">{profile.nickname}</p>
            )}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={coach.status === "active" ? "default" : "outline"}>
                {coach.status === "active" ? "Aktif" : "Tidak Aktif"}
              </Badge>
              {branch?.name && (
                <span className="text-xs text-muted-foreground">{branch.name}</span>
              )}
            </div>
          </div>
        </div>

        {/* Specializations */}
        {profile?.specializations && (profile.specializations as string[]).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(profile.specializations as string[]).map((s) => (
              <span key={s} className="text-xs bg-primary/10 text-primary rounded-full px-2.5 py-0.5">
                {s}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Coach ID + QR */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <IdCard className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">ID Pelatih</p>
            <p className="font-mono font-semibold">{coach.coach_id_code}</p>
          </div>
        </div>
        {/* Coach QR */}
        <div className="flex justify-center pt-2">
          <CoachQrDisplay coachCode={coach.coach_id_code} coachName={profile?.full_name ?? coach.coach_id_code} />
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Informasi</p>
        <InfoRow
          icon={Phone}
          label="No. HP"
          value={profile?.phone ?? null}
        />
        <InfoRow
          icon={Calendar}
          label="Tanggal Lahir"
          value={profile?.dob
            ? new Date(profile.dob).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
            : null}
        />
        <InfoRow
          icon={MapPin}
          label="Cabang"
          value={branch?.name ?? null}
        />
      </div>

      {/* Sertifikat */}
      <CertificateSection initialCerts={certificates as any} />

      {/* Edit profile */}
      {pendingRequest ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-2 text-sm text-amber-800">
          <Clock className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Ada permintaan perubahan yang sedang menunggu</p>
            <p className="text-xs mt-0.5 text-amber-700">
              Dikirim {new Date(pendingRequest.created_at).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric",
              })}. Hubungi admin jika membutuhkan bantuan.
            </p>
          </div>
        </div>
      ) : profile ? (
        <EditCoachProfilForm
          profile={{
            coach_id: coach.id,
            full_name: profile.full_name,
            nickname: profile.nickname,
            dob: profile.dob,
            gender: profile.gender,
            phone: profile.phone,
            specializations: profile.specializations,
          }}
        />
      ) : null}

      {/* Settings link */}
      <Link
        href="/c/pengaturan"
        className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
      >
        <Settings className="h-4 w-4" />
        Pengaturan Akun
      </Link>
    </>
  );
}

export default function CoachProfilPage() {
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-24">
      <Suspense fallback={<SimpleSkeleton />}>
        <PageContent />
      </Suspense>
    </div>
  );
}
