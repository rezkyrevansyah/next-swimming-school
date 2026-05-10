import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CreateCoachForm } from "./create-coach-form";

export default async function CreateCoachPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: branches } = await supabase
    .from("branches")
    .select("id, name")
    .eq("status", "active")
    .order("name");

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/a/coach"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Tambah Pelatih</h1>
          <p className="text-muted-foreground text-sm">
            Isi data pelatih baru — akun akan dibuat otomatis
          </p>
        </div>
      </div>

      <CreateCoachForm branches={branches ?? []} />
    </div>
  );
}
