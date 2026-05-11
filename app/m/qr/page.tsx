import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { QrDisplay } from "./qr-display";

export default async function MemberQrPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get member record + profile
  const { data: member } = await supabase
    .from("members")
    .select(`
      id, member_id_code, status,
      member_profiles(full_name, nickname)
    `)
    .eq("user_id", user.id)
    .single();

  if (!member || member.status !== "active") redirect("/m/dashboard");

  const profile = Array.isArray(member.member_profiles)
    ? member.member_profiles[0]
    : member.member_profiles;

  return (
    <QrDisplay
      memberId={member.id}
      memberCode={member.member_id_code}
      fullName={profile?.full_name ?? ""}
      nickname={profile?.nickname ?? null}
    />
  );
}
