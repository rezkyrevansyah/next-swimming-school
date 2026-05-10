import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CreateClassForm } from "./create-class-form";

export default async function CreateClassPage() {
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
          href="/a/kelas"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Tambah Kelas</h1>
          <p className="text-muted-foreground text-sm">Isi detail kelas baru</p>
        </div>
      </div>

      <CreateClassForm branches={branches ?? []} />
    </div>
  );
}
