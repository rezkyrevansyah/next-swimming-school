import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Phone, MessageCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ semester_id?: string }>;
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").replace(/^0/, "62");
}

export default async function RapotNotifikasiPage({ searchParams }: PageProps) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const semesterFilter = params.semester_id ?? "";

  // Fetch semesters for filter
  const { data: semesters } = await supabase
    .from("semesters")
    .select("id, name")
    .order("start_date", { ascending: false });

  // Fetch published report cards with member contact info
  let query = supabase
    .from("report_cards")
    .select(`
      id, published_at,
      members(
        id,
        member_profiles(full_name, phone, phone_owner, parent_phone, parent_name)
      ),
      classes(name),
      semesters(id, name)
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (semesterFilter) query = query.eq("semester_id", semesterFilter);

  const { data: reports } = await query;

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/a/rapot"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Notifikasi Rapot via WA</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kirim notifikasi ke orang tua / anggota yang rapotnya sudah dipublikasikan
          </p>
        </div>
      </div>

      {/* Semester filter */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/a/rapot/notifikasi"
          className={cn(
            buttonVariants({ variant: semesterFilter === "" ? "default" : "outline", size: "sm" })
          )}
        >
          Semua Semester
        </Link>
        {(semesters ?? []).map((s) => (
          <Link
            key={s.id}
            href={`/a/rapot/notifikasi?semester_id=${s.id}`}
            className={cn(
              buttonVariants({
                variant: semesterFilter === s.id ? "default" : "outline",
                size: "sm",
              })
            )}
          >
            {s.name}
          </Link>
        ))}
      </div>

      {/* Info box */}
      <div className="flex items-start gap-2 rounded-xl border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <MessageCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Klik tombol WA untuk membuka WhatsApp dengan pesan yang sudah disiapkan. Pastikan nomor
          telepon anggota sudah tersimpan dengan benar.
        </p>
      </div>

      {/* List */}
      {!reports || reports.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center text-muted-foreground text-sm">
          Belum ada rapot yang dipublikasikan
          {semesterFilter ? " untuk semester ini" : ""}.
        </div>
      ) : (
        <div className="rounded-xl border divide-y overflow-hidden">
          {reports.map((r) => {
            const member = Array.isArray(r.members) ? r.members[0] : r.members;
            const profile = Array.isArray(member?.member_profiles)
              ? member?.member_profiles[0]
              : member?.member_profiles;
            const cls = Array.isArray(r.classes) ? r.classes[0] : r.classes;
            const semester = Array.isArray(r.semesters) ? r.semesters[0] : r.semesters;

            const rawPhone =
              profile?.phone_owner === "parent"
                ? profile?.parent_phone
                : profile?.phone;
            const recipientName =
              profile?.phone_owner === "parent"
                ? profile?.parent_name || profile?.full_name
                : profile?.full_name;

            const waHref = rawPhone
              ? `https://wa.me/${normalizePhone(rawPhone)}?text=${encodeURIComponent(
                  `Halo ${recipientName ?? "Bapak/Ibu"}, rapot kelas ${cls?.name ?? "renang"} untuk semester ${semester?.name ?? ""} sudah tersedia. Silakan hubungi kami untuk informasi lebih lanjut. Terima kasih 🏊`
                )}`
              : null;

            return (
              <div key={r.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {profile?.full_name ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cls?.name ?? "—"} · {semester?.name ?? "—"}
                  </p>
                  {r.published_at && (
                    <p className="text-xs text-muted-foreground">
                      Publish:{" "}
                      {new Date(r.published_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  )}
                  {!rawPhone && (
                    <p className="text-xs text-destructive mt-0.5">Nomor telepon tidak tersedia</p>
                  )}
                </div>
                {waHref ? (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-2 shrink-0"
                    )}
                  >
                    <Phone className="h-3.5 w-3.5" />
                    WA
                  </a>
                ) : (
                  <span className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "gap-2 shrink-0 opacity-40 pointer-events-none"
                  )}>
                    <Phone className="h-3.5 w-3.5" />
                    WA
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
