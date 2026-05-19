"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { ActionResult } from "@/lib/types/common";
import { coachReviewSchema } from "@/lib/schemas/review";

export async function submitCoachReview(input: {
  report_card_id: string;
  rating: number;
  comment?: string;
}): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const parsed = coachReviewSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const { report_card_id, rating, comment } = parsed.data;

  // Get member record for this user
  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!member) return { error: "Profil member tidak ditemukan." };

  // Verify the report card belongs to this member and is published
  const { data: reportCard } = await supabase
    .from("report_cards")
    .select("id, coach_id, status")
    .eq("id", report_card_id)
    .eq("member_id", member.id)
    .eq("status", "published")
    .single();
  if (!reportCard) return { error: "Rapot tidak ditemukan atau belum dipublikasikan." };

  // Check if review already exists
  const { data: existing } = await supabase
    .from("coach_reviews")
    .select("id, edited_at")
    .eq("report_card_id", report_card_id)
    .eq("member_id", member.id)
    .maybeSingle();

  if (existing) return { error: "Review sudah pernah dikirim. Gunakan edit jika ingin mengubah." };

  const { error } = await supabase.from("coach_reviews").insert({
    report_card_id,
    member_id: member.id,
    coach_id: reportCard.coach_id,
    rating,
    comment: comment || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/m/rapot");
  return { data: undefined };
}

export async function editCoachReview(input: {
  review_id: string;
  rating: number;
  comment?: string;
}): Promise<ActionResult> {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const { review_id, rating, comment } = input;
  if (!rating || rating < 1 || rating > 10) return { error: "Rating harus antara 1–10." };

  // Get member
  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!member) return { error: "Profil member tidak ditemukan." };

  // Verify ownership and check if already edited once
  const { data: review } = await supabase
    .from("coach_reviews")
    .select("id, edited_at")
    .eq("id", review_id)
    .eq("member_id", member.id)
    .single();
  if (!review) return { error: "Review tidak ditemukan." };
  if (review.edited_at) return { error: "Review hanya bisa diedit 1 kali." };

  const { error } = await supabase
    .from("coach_reviews")
    .update({ rating, comment: comment || null, edited_at: new Date().toISOString() })
    .eq("id", review_id);
  if (error) return { error: error.message };

  revalidatePath("/m/rapot");
  return { data: undefined };
}
