import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Users, UserCheck, BookOpen, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

async function getDashboardStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [
    { count: totalMembers },
    { count: activeMembers },
    { count: totalCoaches },
    { count: totalClasses },
  ] = await Promise.all([
    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("members")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "active"),
    supabase
      .from("coaches")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "active"),
    supabase
      .from("classes")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("status", "active"),
  ]);

  return {
    totalMembers: totalMembers ?? 0,
    activeMembers: activeMembers ?? 0,
    totalCoaches: totalCoaches ?? 0,
    totalClasses: totalClasses ?? 0,
  };
}

const STAT_CARDS = [
  {
    key: "totalMembers" as const,
    label: "Total Anggota",
    icon: Users,
    description: "Semua anggota terdaftar",
  },
  {
    key: "activeMembers" as const,
    label: "Anggota Aktif",
    icon: TrendingUp,
    description: "Status aktif saat ini",
  },
  {
    key: "totalCoaches" as const,
    label: "Pelatih Aktif",
    icon: UserCheck,
    description: "Pelatih berstatus aktif",
  },
  {
    key: "totalClasses" as const,
    label: "Kelas Aktif",
    icon: BookOpen,
    description: "Kelas sedang berjalan",
  },
];

export default async function AdminDashboardPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const stats = await getDashboardStats(supabase);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Selamat datang kembali. Berikut ringkasan data terkini.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, description }) => (
          <Card key={key} size="sm">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {label}
                </span>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats[key]}</div>
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
