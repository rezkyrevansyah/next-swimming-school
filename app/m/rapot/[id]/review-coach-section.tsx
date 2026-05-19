"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { submitCoachReview, editCoachReview } from "@/lib/actions/review";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ExistingReview {
  id: string;
  rating: number;
  comment: string | null;
  edited_at: string | null;
  created_at: string;
}

interface Props {
  reportCardId: string;
  coachName: string;
  existingReview: ExistingReview | null;
}

function StarRating({
  value,
  onChange,
  readonly,
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={cn("h-7 w-7 transition-colors", readonly && "cursor-default")}
        >
          <Star
            className={cn(
              "h-6 w-6",
              n <= (hover || value)
                ? "text-amber-400 fill-amber-400"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewCoachSection({ reportCardId, coachName, existingReview }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [editing, setEditing] = useState(!existingReview);

  const canEdit = !!existingReview && !existingReview.edited_at;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { toast.error("Pilih rating terlebih dahulu"); return; }

    startTransition(async () => {
      let result;
      if (existingReview) {
        result = await editCoachReview({ review_id: existingReview.id, rating, comment: comment || undefined });
      } else {
        result = await submitCoachReview({ report_card_id: reportCardId, rating, comment: comment || undefined });
      }
      if (result.error) { toast.error(result.error); return; }
      toast.success(existingReview ? "Review berhasil diperbarui" : "Review berhasil dikirim");
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-sm">Beri Nilai Pelatih</h2>
        {existingReview && !editing && canEdit && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs text-primary hover:underline"
          >
            Edit
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Bagaimana pengalamanmu bersama pelatih <strong>{coachName}</strong> semester ini?
      </p>

      {existingReview && !editing ? (
        <div className="space-y-2">
          <StarRating value={existingReview.rating} readonly />
          <p className="text-xs text-muted-foreground">{existingReview.rating}/10</p>
          {existingReview.comment && (
            <p className="text-sm text-muted-foreground italic">&ldquo;{existingReview.comment}&rdquo;</p>
          )}
          <p className="text-xs text-muted-foreground/60">
            {existingReview.edited_at
              ? `Diedit ${new Date(existingReview.edited_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`
              : `Dikirim ${new Date(existingReview.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`}
            {!canEdit && existingReview.edited_at && " · Tidak bisa diedit lagi"}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <StarRating value={rating} onChange={setRating} />
            {rating > 0 && (
              <p className="text-xs text-muted-foreground">{rating}/10</p>
            )}
          </div>

          <div className="space-y-1">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tulis komentarmu... (opsional)"
              rows={3}
              maxLength={1000}
            />
            {comment.length > 900 && (
              <p className="text-xs text-muted-foreground text-right">{comment.length}/1000</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isPending || rating === 0}>
              {isPending ? "Mengirim..." : existingReview ? "Simpan Perubahan" : "Kirim Review"}
            </Button>
            {existingReview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { setEditing(false); setRating(existingReview.rating); setComment(existingReview.comment ?? ""); }}
                disabled={isPending}
              >
                Batal
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
