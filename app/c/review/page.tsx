import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Star, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <Star
          key={n}
          className={cn(
            "h-3.5 w-3.5",
            n <= rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto animate-pulse">
      <div className="h-7 w-40 bg-muted rounded" />
      <div className="h-20 bg-muted rounded-xl" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function PageContent() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: coach } = await supabase
    .from("coaches")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!coach) {
    return (
      <div className="p-6 text-center space-y-2">
        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
        <p className="text-sm text-muted-foreground">Profil pelatih tidak ditemukan.</p>
      </div>
    );
  }

  const { data: reviews } = await supabase
    .from("coach_reviews")
    .select(`
      id, rating, comment, edited_at, created_at,
      report_cards(
        semesters(name),
        classes(name)
      ),
      members(member_profiles(full_name, nickname))
    `)
    .eq("coach_id", coach.id)
    .order("created_at", { ascending: false });

  const totalReviews = (reviews ?? []).length;
  const avgRating = totalReviews > 0
    ? (reviews!.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : null;

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto">
      <div className="pt-2">
        <h1 className="text-xl font-semibold">Review dari Member</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{totalReviews} review</p>
      </div>

      {/* Summary */}
      {avgRating && (
        <div className="rounded-xl border p-4 flex items-center gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-amber-500">{avgRating}</p>
            <p className="text-xs text-muted-foreground">dari 10</p>
          </div>
          <div className="flex-1">
            <StarDisplay rating={Math.round(Number(avgRating))} />
            <p className="text-xs text-muted-foreground mt-1">{totalReviews} review</p>
          </div>
        </div>
      )}

      {totalReviews === 0 ? (
        <div className="rounded-xl border px-4 py-10 text-center text-sm text-muted-foreground">
          Belum ada review dari member.
        </div>
      ) : (
        <div className="space-y-3">
          {(reviews ?? []).map((r) => {
            const rc = Array.isArray(r.report_cards) ? r.report_cards[0] : r.report_cards;
            const semester = Array.isArray(rc?.semesters) ? rc.semesters[0] : rc?.semesters;
            const cls = Array.isArray(rc?.classes) ? rc.classes[0] : rc?.classes;
            const memberRec = Array.isArray(r.members) ? r.members[0] : r.members;
            const mp = Array.isArray(memberRec?.member_profiles) ? memberRec.member_profiles[0] : memberRec?.member_profiles;
            const memberName = mp?.nickname || mp?.full_name || "Member";

            return (
              <div key={r.id} className="rounded-xl border p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{memberName}</p>
                    <p className="text-xs text-muted-foreground">
                      {semester?.name ?? "—"} · {cls?.name ?? "—"}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-amber-500">{r.rating}/10</p>
                  </div>
                </div>
                <StarDisplay rating={r.rating} />
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

export default function CoachReviewPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContent />
    </Suspense>
  );
}
