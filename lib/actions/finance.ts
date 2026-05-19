"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import {
  generateInvoicesSchema,
  recordPaymentSchema,
  deletePaymentSchema,
  updateInvoiceNotesSchema,
  applyDiscountSchema,
} from "@/lib/schemas/finance";
import type { ActionResult } from "@/lib/types/common";
import { logActivity } from "@/lib/utils/activity-log";

// ============================================================================
// Types
// ============================================================================
export type InvoiceRow = {
  id: string;
  member_id: string;
  branch_id: string;
  period_month: string;
  total_amount: number;
  amount_paid: number;
  status: "unpaid" | "paid" | "partial";
  due_date: string | null;
  notes: string | null;
  generated_at: string;
  created_at: string;
  updated_at: string;
};

export type PaymentRow = {
  id: string;
  invoice_id: string;
  amount: number;
  paid_at: string;
  proof_url: string | null;
  recorded_by: string | null;
  notes: string | null;
  created_at: string;
};

export type InvoiceWithMember = InvoiceRow & {
  members: {
    member_id_code: string;
    member_profiles: { full_name: string } | { full_name: string }[] | null;
    class_members: {
      classes: { id: string; name: string; monthly_price: number } | null;
    }[];
  } | null;
};

// ============================================================================
// generateMonthlyInvoices
// Creates invoices for all active regular members of a branch for a given month.
// Skips members who already have an invoice for that month.
// ============================================================================
export async function generateMonthlyInvoices(
  formData: FormData
): Promise<ActionResult<{ created: number; skipped: number }>> {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = generateInvoicesSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten() };
  }

  const { branch_id, period_month, due_date, notes } = parsed.data;

  // 1. Fetch all active regular members with payment_handling = 'individual'
  //    who belong to this branch and have at least one enrolled class.
  const { data: members, error: membersError } = await supabase
    .from("members")
    .select(
      `
      id,
      class_members!inner(
        status,
        classes(id, name, monthly_price)
      )
    `
    )
    .eq("branch_id", branch_id)
    .eq("status", "active")
    .eq("type", "regular")
    .eq("payment_handling", "individual")
    .is("deleted_at", null)
    .eq("class_members.status", "enrolled");

  if (membersError) {
    return { error: `Gagal mengambil data anggota: ${membersError.message}` };
  }

  if (!members || members.length === 0) {
    return {
      error:
        "Tidak ada anggota aktif yang memenuhi syarat di cabang ini. Pastikan ada anggota reguler yang terdaftar di kelas.",
    };
  }

  // 2. Check which members already have an invoice for this month
  const memberIds = members.map((m) => m.id);
  const { data: existingInvoices } = await supabase
    .from("monthly_invoices")
    .select("member_id")
    .eq("branch_id", branch_id)
    .eq("period_month", period_month)
    .in("member_id", memberIds);

  const alreadyInvoiced = new Set((existingInvoices ?? []).map((i) => i.member_id));

  // 3. Build invoices to create
  let created = 0;
  let skipped = alreadyInvoiced.size;

  const dueDateValue = due_date ? due_date : null;
  const notesValue = notes || null;

  for (const member of members) {
    if (alreadyInvoiced.has(member.id)) continue;

    // Calculate total from enrolled classes
    const enrolledClasses = Array.isArray(member.class_members)
      ? member.class_members
      : [];
    const totalAmount = enrolledClasses.reduce((sum, cm) => {
      const cls = Array.isArray(cm.classes) ? cm.classes[0] : cm.classes;
      return sum + (cls?.monthly_price ?? 0);
    }, 0);

    // Insert invoice
    const { data: invoice, error: invError } = await supabase
      .from("monthly_invoices")
      .insert({
        member_id: member.id,
        branch_id,
        period_month,
        total_amount: totalAmount,
        due_date: dueDateValue,
        notes: notesValue,
      })
      .select("id")
      .single();

    if (invError || !invoice) {
      // Skip this member on conflict/error, count as skipped
      skipped++;
      continue;
    }

    // Insert line items (one per class)
    const lineItems = enrolledClasses
      .map((cm) => {
        const cls = Array.isArray(cm.classes) ? cm.classes[0] : cm.classes;
        if (!cls) return null;
        return {
          invoice_id: invoice.id,
          class_id: cls.id,
          description: `Biaya kelas ${cls.name} — ${period_month}`,
          amount: cls.monthly_price ?? 0,
        };
      })
      .filter(Boolean);

    if (lineItems.length > 0) {
      await supabase.from("invoice_items").insert(lineItems as any);
    }

    created++;
  }

  await logActivity(supabase, {
    action: "generate_invoices",
    resource_type: "monthly_invoices",
    branch_id,
    metadata: { period_month, created, skipped },
  });

  revalidatePath("/a/finansial");

  return { data: { created, skipped } };
}

// ============================================================================
// recordPayment
// Records a payment against an invoice. The DB trigger handles recalculating
// amount_paid and invoice status automatically.
// ============================================================================
export async function recordPayment(
  formData: FormData
): Promise<ActionResult<PaymentRow>> {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = recordPaymentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten() };
  }

  const { invoice_id, amount, paid_at, notes, proof_url } = parsed.data;

  // Verify invoice exists and user can access it (RLS will guard)
  const { data: invoice, error: fetchErr } = await supabase
    .from("monthly_invoices")
    .select("id, total_amount, amount_paid, status, branch_id")
    .eq("id", invoice_id)
    .single();

  if (fetchErr || !invoice) {
    return { error: "Invoice tidak ditemukan atau tidak dapat diakses." };
  }

  // Guard: do not accept payment on already fully paid invoice
  if (invoice.status === "paid") {
    return { error: "Invoice ini sudah lunas. Tidak perlu pembayaran tambahan." };
  }

  const paidAtValue = paid_at ? new Date(paid_at).toISOString() : new Date().toISOString();

  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .insert({
      invoice_id,
      amount,
      paid_at: paidAtValue,
      recorded_by: user.id,
      notes: notes || null,
      proof_url: proof_url || null,
    })
    .select()
    .single();

  if (payErr || !payment) {
    return { error: `Gagal mencatat pembayaran: ${payErr?.message}` };
  }

  await logActivity(supabase, {
    action: "record_payment",
    resource_type: "payments",
    resource_id: payment.id,
    branch_id: invoice.branch_id,
    metadata: { invoice_id, amount },
  });

  revalidatePath(`/a/finansial/${invoice_id}`);
  revalidatePath("/a/finansial");

  return { data: payment as PaymentRow };
}

// ============================================================================
// deletePayment
// Removes a payment record. The DB trigger auto-recalculates invoice status.
// ============================================================================
export async function deletePayment(
  formData: FormData
): Promise<ActionResult<void>> {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = deletePaymentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data tidak valid." };
  }

  // Fetch payment to get invoice info for logging
  const { data: payment, error: fetchErr } = await supabase
    .from("payments")
    .select("id, invoice_id, amount, monthly_invoices(branch_id)")
    .eq("id", parsed.data.payment_id)
    .single();

  if (fetchErr || !payment) {
    return { error: "Pembayaran tidak ditemukan." };
  }

  const { error: delErr } = await supabase
    .from("payments")
    .delete()
    .eq("id", parsed.data.payment_id);

  if (delErr) {
    return { error: `Gagal menghapus pembayaran: ${delErr.message}` };
  }

  const inv = Array.isArray(payment.monthly_invoices)
    ? payment.monthly_invoices[0]
    : payment.monthly_invoices;

  await logActivity(supabase, {
    action: "delete_payment",
    resource_type: "payments",
    resource_id: parsed.data.payment_id,
    branch_id: (inv as any)?.branch_id,
    metadata: { invoice_id: payment.invoice_id, amount: payment.amount },
  });

  revalidatePath(`/a/finansial/${payment.invoice_id}`);
  revalidatePath("/a/finansial");

  return { data: undefined };
}

// ============================================================================
// updateInvoiceNotes
// Allows admin to update notes and due_date on an existing invoice.
// ============================================================================
export async function updateInvoiceNotes(
  formData: FormData
): Promise<ActionResult<void>> {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateInvoiceNotesSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten() };
  }

  const { invoice_id, notes, due_date } = parsed.data;

  const { error } = await supabase
    .from("monthly_invoices")
    .update({
      notes: notes || null,
      due_date: due_date || null,
    })
    .eq("id", invoice_id);

  if (error) {
    return { error: `Gagal memperbarui invoice: ${error.message}` };
  }

  revalidatePath(`/a/finansial/${invoice_id}`);
  revalidatePath("/a/finansial");

  return { data: undefined };
}

// ============================================================================
// applyDiscount
// Applies a nominal or percent discount to an invoice. Admin/owner only.
// ============================================================================
export async function applyDiscount(
  formData: FormData
): Promise<ActionResult<void>> {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = applyDiscountSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Data tidak valid.", fieldErrors: parsed.error.flatten() };
  }

  const { invoice_id, discount_type, discount_value, discount_reason } = parsed.data;

  const { data: invoice, error: fetchErr } = await supabase
    .from("monthly_invoices")
    .select("id, total_amount, branch_id")
    .eq("id", invoice_id)
    .single();

  if (fetchErr || !invoice) {
    return { error: "Invoice tidak ditemukan." };
  }

  const { error } = await supabase
    .from("monthly_invoices")
    .update({
      discount_type,
      discount_value,
      discount_reason: discount_reason || null,
      discounted_by: user.id,
    })
    .eq("id", invoice_id);

  if (error) {
    return { error: `Gagal menerapkan diskon: ${error.message}` };
  }

  await logActivity(supabase, {
    action: "apply_discount",
    resource_type: "monthly_invoices",
    resource_id: invoice_id,
    branch_id: invoice.branch_id,
    metadata: { discount_type, discount_value },
  });

  revalidatePath(`/a/finansial/${invoice_id}`);
  revalidatePath("/a/finansial");

  return { data: undefined };
}
