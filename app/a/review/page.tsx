import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <Star
          key={n}
          className={cn(
            "h-3 w-3",
            n <= rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-7 w-40 bg-muted rounded" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}

async function PageContent() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: reviews, count } = await supabase
    .from("coach_reviews")
    .select(`
      id, rating, comment, edited_at, created_at,
      coaches(id, coach_profiles(full_name)),
      report_cards(
        semesters(name),
        classes(name)
      ),
      members(member_profiles(full_name, nickname))
    `, { count: "exact" })
    .order("created_at", { ascending: false });

  const totalReviews = count ?? 0;
  const avgRating = totalReviews > 0
    ? ((reviews ?? []).reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : null;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Review Pelatih</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          {totalReviews} review{avgRating ? ` · rata-rata ${avgRating}/10` : ""}
        </p>
      </div>

      {totalReviews === 0 ? (
        <div className="rounded-lg border px-4 py-12 text-center text-sm text-muted-foreground">
          Belum ada review dari member.
        </div>
      ) : (
        <div className="space-y-3">
          {(reviews ?? []).map((r) => {
            const coachRec = Array.isArray(r.coaches) ? r.coaches[0] : r.coaches;
            const coachProfile = Array.isArray(coachRec?.coach_profiles) ? coachRec.coach_profiles[0] : coachRec?.coach_profiles;
            const rc = Array.isArray(r.report_cards) ? r.report_cards[0] : r.report_cards;
            const semester = Array.isArray(rc?.semesters) ? rc.semesters[0] : rc?.semesters;
            const cls = Array.isArray(rc?.classes) ? rc.classes[0] : rc?.classes;
            const memberRec = Array.isArray(r.members) ? r.members[0] : r.members;
            const mp = Array.isArray(memberRec?.member_profiles) ? memberRec.member_profiles[0] : memberRec?.member_profiles;

            return (
              <div key={r.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">
                        {mp?.nickname || mp?.full_name || "Member"}
                      </p>
                      <span className="text-xs text-muted-foreground">→</span>
                      {coachRec?.id ? (
                        <Link
                          href={`/a/coach/${coachRec.id}`}
                          className="text-sm text-primary hover:underline font-medium"
                        >
                          {coachProfile?.full_name ?? "Pelatih"}
                        </Link>
                      ) : (
                        <p className="text-sm">{coachProfile?.full_name ?? "Pelatih"}</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {semester?.name ?? "—"} · {cls?.name ?? "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-amber-500 text-sm">{r.rating}/10</p>
                    <StarDisplay rating={r.rating} />
                  </div>
                </div>
                {r.comment && (
                  <p className="text-sm text-muted-foreground italic">&ldquo;{r.comment}&rdquo;</p>
                )}
                <p className="text-xs text-muted-foreground/60">
                  {new Date(r.created_at).toLocaleDateString("id-ID", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                  {r.edited_at && " · diedit"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminReviewPage() {
  return (
    <div>
      <Suspense fallback={<PageSkeleton />}>
        <PageContent />
      </Suspense>
    </div>
  );
}
