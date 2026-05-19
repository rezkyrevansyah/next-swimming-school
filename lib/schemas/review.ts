import { z } from "zod";

export const coachReviewSchema = z.object({
  report_card_id: z.string().uuid(),
  rating: z.coerce.number().int().min(1, "Rating minimal 1").max(10, "Rating maksimal 10"),
  comment: z.string().max(1000).optional().or(z.literal("")),
});

export type CoachReviewInput = z.infer<typeof coachReviewSchema>;
