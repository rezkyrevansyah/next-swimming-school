"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  createHolidaySchema,
  createCoachRateSchema,
  updateCoachRateSchema,
  generateCoachInvoiceSchema,
  selectedSessionItemSchema,
} from "@/lib/schemas/coach-invoice";
import type { ActionResult } from "@/lib/types/common";
import type { CoachSessionRow, CoachRateRow } from "@/lib/types/coach-invoice";
import { logActivity } from "@/lib/utils/activity-log";

// ============================================================================
// Helpers
// ============================================================================

const DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/** Expand class_schedules ke list tanggal dalam sebulan */
function expandScheduleToDates(
  dayOfWeek: number,
  year: number,
  month: number // 1-indexed
): string[] {
  const dates: string[] = [];
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);

  for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === dayOfWeek) {
      dates.push(d.toISOString().slice(0, 10));
    }
  }
  return dates;
}

/** Resolve tarif per sesi berdasarkan hierarki fallback */
function resolveRate(
  rates: CoachRateRow[],
  branchId: string,
  classId: string,
  coachId: string,
  sessionDate: string
): number {
  // Filter rates yang berlaku (effective_from <= sessionDate) dan branch match
  const applicable = rates
    .filter((r) => r.branch_id === branchId && r.effective_from <= sessionDate)
    .sort((a, b) => b.effective_from.localeCompare(a.effective_from)); // terbaru duluan

  // Level 1: coach + kelas spesifik
  const l1 = applicable.find((r) => r.coach_id === coachId && r.class_id === classId);
  if (l1) return Number(l1.rate_per_session);

  // Level 2: kelas only
  const l2 = applicable.find((r) => r.class_id === classId && !r.coach_id);
  if (l2) return Number(l2.rate_per_session);

  // Level 3: coach only
  const l3 = applicable.find((r) => r.coach_id === coachId && !r.class_id);
  if (l3) return Number(l3.rate_per_session);

  // Level 4: branch default
  const l4 = applicable.find((r) => !r.coach_id && !r.class_id);
  return l4 ? Number(l4.rate_per_session) : 0;
}

// ============================================================================
// getCoachSessionsForMonth
// Query helper (dipanggil dari Server Components)
// ============================================================================
export async function getCoachSessionsForMonth(
  coachId: string,
  periodMonth: string // 'YYYY-MM'
): Promise<CoachSessionRow[]> {
  const supabase = createClient(await cookies());
  const [yearStr, monthStr] = periodMonth.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);

  const firstDay = `${periodMonth}-01`;
  const lastDayDate = new Date(year, month, 0);
  const lastDay = lastDayDate.toISOString().slice(0, 10);

  // 1. Ambil semua kelas yang coach ini di-assign
  const { data: assignments } = await supabase
    .from("class_coaches")
    .select(`
      class_id,
      classes(id, name, branch_id, status,
        class_schedules(day_of_week, start_time, end_time)
      )
    `)
    .eq("coach_id", coachId);

  if (!assignments || assignments.length === 0) return [];

  // Kumpulkan branch_ids dan class_ids
  const classIds = assignments.map((a) => a.class_id);
  const branchIds = [
    ...new Set(
      assignments.map((a) => {
        const cls = Array.isArray(a.classes) ? a.classes[0] : a.classes;
        return cls?.branch_id;
      }).filter(Boolean)
    ),
  ] as string[];

  // 2. Fetch semua data yang dibutuhkan secara paralel
  const [
    { data: holidays },
    { data: coachLeaves },
    { data: replacementLeaves },
    { data: rates },
  ] = await Promise.all([
    // Hari libur yang berlaku (cabang atau kelas spesifik)
    supabase
      .from("class_holidays")
      .select("branch_id, class_id, holiday_date")
      .gte("holiday_date", firstDay)
      .lte("holiday_date", lastDay)
      .or(
        branchIds.map((bid) => `branch_id.eq.${bid}`).join(",") +
        (classIds.length > 0 ? "," + classIds.map((cid) => `class_id.eq.${cid}`).join(",") : "")
      ),

    // Izin coach ini
    supabase
      .from("coach_leaves")
      .select("class_id, leave_date")
      .eq("coach_id", coachId)
      .gte("leave_date", firstDay)
      .lte("leave_date", lastDay),

    // Sesi di mana coach ini jadi pengganti
    supabase
      .from("coach_leaves")
      .select("class_id, leave_date")
      .eq("replacement_coach_id", coachId)
      .gte("leave_date", firstDay)
      .lte("leave_date", lastDay),

    // Semua rates relevan untuk branch + coach ini
    supabase
      .from("coach_rates")
      .select("*")
      .in("branch_id", branchIds)
      .lte("effective_from", lastDay)
      .or(`coach_id.eq.${coachId},coach_id.is.null`),
  ]);

  // Build lookup sets
  const holidaySet = new Set<string>();
  (holidays ?? []).forEach((h) => {
    // Tandai kombinasi kelas+tanggal yang kena libur
    // Akan dicek per kelas saat expand
    holidaySet.add(`${h.branch_id ?? ""}|${h.class_id ?? ""}|${h.holiday_date}`);
  });

  const leaveSet = new Set<string>(
    (coachLeaves ?? []).map((l) => `${l.class_id}|${l.leave_date}`)
  );

  const replacementSet = new Set<string>(
    (replacementLeaves ?? []).map((l) => `${l.class_id}|${l.leave_date}`)
  );

  const ratesData = (rates ?? []) as CoachRateRow[];

  // 3. Build sesi untuk setiap kelas
  const sessions: CoachSessionRow[] = [];

  for (const assignment of assignments) {
    const cls = Array.isArray(assignment.classes)
      ? assignment.classes[0]
      : assignment.classes;

    if (!cls || cls.status !== "active") continue;

    const schedules = (cls.class_schedules ?? []) as { day_of_week: number }[];
    // Deduplicate hari jadwal
    const daysOfWeek = [...new Set(schedules.map((s) => s.day_of_week))];

    for (const dow of daysOfWeek) {
      const dates = expandScheduleToDates(dow, year, month);

      for (const date of dates) {
        // Cek libur cabang
        const branchHoliday = holidaySet.has(`${cls.branch_id}||${date}`);
        // Cek libur kelas spesifik
        const classHoliday = holidaySet.has(`|${cls.id}|${date}`);
        // Cek libur cabang (format: branchId|classId|date dimana classId kosong)
        const branchHolidayAlt = (holidays ?? []).some(
          (h) => h.branch_id === cls.branch_id && !h.class_id && h.holiday_date === date
        );
        const classHolidayAlt = (holidays ?? []).some(
          (h) => h.class_id === cls.id && h.holiday_date === date
        );

        if (branchHoliday || classHoliday || branchHolidayAlt || classHolidayAlt) {
          // Skip hari libur — tidak masuk list sama sekali
          continue;
        }

        const key = `${cls.id}|${date}`;
        const isLeave = leaveSet.has(key);
        const isReplacement = replacementSet.has(key);

        let status: CoachSessionRow["status"] = "hadir";
        let eligible = true;
        let ineligible_reason: string | undefined;

        if (isLeave) {
          status = "izin";
          eligible = false;
          ineligible_reason = "Coach izin di sesi ini";
        } else if (isReplacement) {
          status = "pengganti";
          eligible = false;
          ineligible_reason = "Coach menggantikan di kelas lain";
        }

        const rate = resolveRate(ratesData, cls.branch_id, cls.id, coachId, date);

        sessions.push({
          class_id: cls.id,
          class_name: cls.name,
          branch_id: cls.branch_id,
          session_date: date,
          day_name: DAYS[dow],
          status,
          eligible,
          ineligible_reason,
          rate_per_session: rate,
        });
      }
    }
  }

  // Sort by date asc, then class name
  sessions.sort((a, b) =>
    a.session_date.localeCompare(b.session_date) ||
    a.class_name.localeCompare(b.class_name)
  );

  return sessions;
}

// ============================================================================
// Holiday Actions
// ============================================================================

export async function createHoliday(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = createHolidaySchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten() };
  }

  const { branch_id, class_id, holiday_date, name } = parsed.data;

  const { data, error } = await supabase
    .from("class_holidays")
    .insert({
      branch_id: branch_id || null,
      class_id: class_id || null,
      holiday_date,
      name,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "Sudah ada libur di tanggal tersebut untuk cabang/kelas yang sama." };
    }
    return { error: `Gagal menyimpan hari libur: ${error.message}` };
  }

  await logActivity(supabase, {
    action: "create_holiday",
    resource_type: "class_holidays",
    resource_id: data.id,
    branch_id: branch_id || undefined,
  });

  revalidatePath("/a/libur");
  return { data: { id: data.id } };
}

export async function deleteHoliday(id: string): Promise<ActionResult<void>> {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const { error } = await supabase
    .from("class_holidays")
    .delete()
    .eq("id", id);

  if (error) return { error: `Gagal menghapus hari libur: ${error.message}` };

  revalidatePath("/a/libur");
  return { data: undefined };
}

// ============================================================================
// Coach Rate Actions
// ============================================================================

export async function upsertCoachRate(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const raw = Object.fromEntries(formData.entries());
  const hasId = !!raw.id;

  const schema = hasId ? updateCoachRateSchema : createCoachRateSchema;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten() };
  }

  const { branch_id, class_id, coach_id, rate_per_session, effective_from, notes } = parsed.data;

  const payload = {
    branch_id,
    class_id: class_id || null,
    coach_id: coach_id || null,
    rate_per_session,
    effective_from,
    notes: notes || null,
    created_by: user.id,
  };

  let id: string;

  if (hasId && "id" in parsed.data) {
    const { data, error } = await supabase
      .from("coach_rates")
      .update(payload)
      .eq("id", parsed.data.id)
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") return { error: "Tarif dengan kombinasi yang sama sudah ada untuk tanggal berlaku ini." };
      return { error: `Gagal memperbarui tarif: ${error.message}` };
    }
    id = data.id;
  } else {
    const { data, error } = await supabase
      .from("coach_rates")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") return { error: "Tarif dengan kombinasi yang sama sudah ada untuk tanggal berlaku ini." };
      return { error: `Gagal menyimpan tarif: ${error.message}` };
    }
    id = data.id;
  }

  await logActivity(supabase, {
    action: hasId ? "update_coach_rate" : "create_coach_rate",
    resource_type: "coach_rates",
    resource_id: id,
    branch_id,
  });

  revalidatePath("/a/tarif-coach");
  revalidatePath("/o/tarif-coach");
  return { data: { id } };
}

export async function deleteCoachRate(id: string): Promise<ActionResult<void>> {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const { error } = await supabase
    .from("coach_rates")
    .delete()
    .eq("id", id);

  if (error) return { error: `Gagal menghapus tarif: ${error.message}` };

  revalidatePath("/a/tarif-coach");
  revalidatePath("/o/tarif-coach");
  return { data: undefined };
}

// ============================================================================
// Generate Coach Invoice
// ============================================================================

export async function generateCoachInvoice(
  formData: FormData
): Promise<ActionResult<{ invoice_id: string }>> {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  // Dapatkan coach_id dari user yang login
  const { data: coach } = await supabase
    .from("coaches")
    .select("id, branch_id")
    .eq("user_id", user.id)
    .single();

  if (!coach) return { error: "Profil pelatih tidak ditemukan." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = generateCoachInvoiceSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten() };
  }

  const { period_month, selected_sessions: sessionsJson } = parsed.data;

  // Parse selected sessions
  let selectedSessions: { class_id: string; session_date: string; rate_per_session: number }[];
  try {
    const arr = JSON.parse(sessionsJson);
    const result = selectedSessionItemSchema.array().safeParse(arr);
    if (!result.success) return { error: "Format sesi tidak valid." };
    selectedSessions = result.data;
  } catch {
    return { error: "Format sesi tidak valid." };
  }

  if (selectedSessions.length === 0) {
    return { error: "Pilih minimal satu sesi." };
  }

  // Validasi setiap sesi: coach harus di-assign ke kelas tersebut
  const classIds = [...new Set(selectedSessions.map((s) => s.class_id))];
  const { data: assignments } = await supabase
    .from("class_coaches")
    .select("class_id")
    .eq("coach_id", coach.id)
    .in("class_id", classIds);

  const assignedClassIds = new Set((assignments ?? []).map((a) => a.class_id));
  const invalidClass = selectedSessions.find((s) => !assignedClassIds.has(s.class_id));
  if (invalidClass) {
    return { error: "Kamu tidak terdaftar di salah satu kelas yang dipilih." };
  }

  // Validasi period_month dari session_date
  const invalidPeriod = selectedSessions.find(
    (s) => !s.session_date.startsWith(period_month)
  );
  if (invalidPeriod) {
    return { error: "Ada sesi yang tidak sesuai dengan periode bulan yang dipilih." };
  }

  const total_sessions = selectedSessions.length;
  const total_amount = selectedSessions.reduce((s, i) => s + i.rate_per_session, 0);

  // Soft-delete invoice lama jika ada
  await supabase
    .from("coach_invoices")
    .update({ deleted_at: new Date().toISOString() })
    .eq("coach_id", coach.id)
    .eq("period_month", period_month)
    .is("deleted_at", null);

  // Insert invoice baru
  const { data: invoice, error: invError } = await supabase
    .from("coach_invoices")
    .insert({
      coach_id: coach.id,
      branch_id: coach.branch_id,
      period_month,
      total_sessions,
      total_amount,
      status: "draft",
      generated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (invError || !invoice) {
    return { error: `Gagal membuat invoice: ${invError?.message}` };
  }

  // Insert items
  const items = selectedSessions.map((s) => ({
    invoice_id: invoice.id,
    class_id: s.class_id,
    session_date: s.session_date,
    rate_per_session: s.rate_per_session,
  }));

  const { error: itemsError } = await supabase
    .from("coach_invoice_items")
    .insert(items);

  if (itemsError) {
    return { error: `Gagal menyimpan detail sesi: ${itemsError.message}` };
  }

  await logActivity(supabase, {
    action: "generate_coach_invoice",
    resource_type: "coach_invoices",
    resource_id: invoice.id,
    branch_id: coach.branch_id,
    metadata: { period_month, total_sessions, total_amount },
  });

  revalidatePath("/c/invoice");
  revalidatePath("/a/invoice-coach");
  revalidatePath("/o/invoice-coach");

  return { data: { invoice_id: invoice.id } };
}

// ============================================================================
// Update Invoice Status (admin/owner)
// ============================================================================

export async function updateCoachInvoiceStatus(
  invoiceId: string,
  status: "draft" | "submitted"
): Promise<ActionResult<void>> {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const { error } = await supabase
    .from("coach_invoices")
    .update({ status })
    .eq("id", invoiceId)
    .is("deleted_at", null);

  if (error) return { error: `Gagal memperbarui status: ${error.message}` };

  revalidatePath("/a/invoice-coach");
  revalidatePath("/o/invoice-coach");
  return { data: undefined };
}
