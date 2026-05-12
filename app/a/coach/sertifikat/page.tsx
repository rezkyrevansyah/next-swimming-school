import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CertApprovalActions } from "./cert-approval-actions";

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  approved: { label: "Disetujui", variant: "default" },
  pending_approval: { label: "Menunggu", variant: "secondary" },
  rejected: { label: "Ditolak", variant: "destructive" },
};

export default async function CoachSertifikatPage({ searchParams }: PageProps) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const statusFilter = params.status ?? "pending_approval";

  let query = supabase
    .from("coach_certificates")
    .select(`
      id, name, photo_url, issued_year, valid_until, no_expiry,
      approval_status, approval_notes, approved_at, created_at,
      coaches(id, coach_id_code, coach_profiles(full_name))
    `)
    .order("created_at", { ascending: true });

  if (statusFilter !== "all") {
    query = query.eq("approval_status", statusFilter);
  }

  const { data: certs } = await query;

  const tabs = [
    { value: "pending_approval", label: "Menunggu" },
    { value: "approved", label: "Disetujui" },
    { value: "rejected", label: "Ditolak" },
    { value: "all", label: "Semua" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-3xl">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Sertifikat Pelatih</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {certs?.length ?? 0} sertifikat
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={`/a/coach/sertifikat?status=${tab.value}`}
            className={cn(
              buttonVariants({ size: "sm", variant: statusFilter === tab.value ? "default" : "outline" })
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {!certs || certs.length === 0 ? (
        <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground flex flex-col items-center gap-3">
          <Award className="h-10 w-10 opacity-30" />
          <p>Tidak ada sertifikat.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.map((cert) => {
            const coach = Array.isArray(cert.coaches) ? cert.coaches[0] : cert.coaches;
            const profile = Array.isArray(coach?.coach_profiles) ? coach.coach_profiles[0] : coach?.coach_profiles;
            const cfg = STATUS_CONFIG[cert.approval_status] ?? STATUS_CONFIG.pending_approval;

            return (
              <div key={cert.id} className="rounded-xl border bg-card overflow-hidden">
                <div className="flex items-start gap-4 p-4">
                  {cert.photo_url ? (
                    <a href={cert.photo_url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                      <img
                        src={cert.photo_url}
                        alt={cert.name}
                        className="h-20 w-20 rounded-lg object-cover border hover:opacity-80 transition-opacity"
                      />
                    </a>
                  ) : (
                    <div className="h-20 w-20 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                      <Award className="h-8 w-8 text-muted-foreground opacity-40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-medium">{cert.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {cert.issued_year ?? "—"}
                      {cert.no_expiry
                        ? " · Tidak ada batas berlaku"
                        : cert.valid_until
                        ? ` · s.d. ${new Date(cert.valid_until).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`
                        : ""}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={cfg.variant} className="text-xs">{cfg.label}</Badge>
                      {coach && (
                        <Link
                          href={`/a/coach/${coach.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {profile?.full_name ?? coach.coach_id_code}
                        </Link>
                      )}
                    </div>
                    {cert.approval_notes && (
                      <p className="text-xs text-muted-foreground italic">{cert.approval_notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Dikirim {new Date(cert.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>

                {cert.approval_status === "pending_approval" && (
                  <CertApprovalActions certId={cert.id} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
