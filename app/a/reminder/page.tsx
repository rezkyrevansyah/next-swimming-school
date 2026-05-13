import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReminderClient } from "./reminder-client";

export default function AdminReminderPage() {
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-3xl">
      <Suspense fallback={
        <div className="p-6 space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-10 bg-muted rounded" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-12 bg-muted rounded" />)}
          </div>
        </div>
      }>
        <PageContentGated />
      </Suspense>
    </div>
  );
}

async function PageContentGated() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <PageContent />;
}

async function PageContent() {
  const supabase = createClient(await cookies());

  // Fetch active members with phone + class info
  const { data: members } = await supabase
    .from("members")
    .select(`
      id, member_id_code,
      member_profiles(full_name, phone, parent_phone, phone_owner),
      class_members(classes(name))
    `)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const waNumber = process.env.NEXT_PUBLIC_WA_NUMBER ?? "";

  const enriched = (members ?? []).map((m) => {
    const profile = Array.isArray(m.member_profiles) ? m.member_profiles[0] : m.member_profiles;
    // Use member's own phone, or parent's phone if phone_owner is parent
    const phone = (profile as any)?.phone_owner === "parent"
      ? (profile as any)?.parent_phone ?? (profile as any)?.phone
      : (profile as any)?.phone;
    const classNames = (m.class_members ?? []).flatMap((cm: any) => {
      const cls = Array.isArray(cm.classes) ? cm.classes[0] : cm.classes;
      return cls?.name ? [cls.name] : [];
    });
    return {
      id: m.id,
      member_id_code: m.member_id_code,
      full_name: (profile as any)?.full_name ?? "—",
      phone: phone ?? null,
      class_names: classNames,
    };
  });

  return (
    <>
      <div>
        <h1 className="text-xl md:text-2xl font-semibold">Reminder WhatsApp</h1>
        <p className="text-muted-foreground text-sm mt-0.5">
          Pilih template, lalu klik tombol WA untuk kirim pesan ke member.
        </p>
      </div>

      <ReminderClient members={enriched} waNumber={waNumber} />
    </>
  );
}
