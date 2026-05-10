import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CreateMemberForm } from "./create-member-form";

export default async function CreateMemberPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
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
          href="/a/member"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Tambah Anggota</h1>
          <p className="text-muted-foreground text-sm">
            Isi data lengkap anggota baru
          </p>
        </div>
      </div>

      <CreateMemberForm branches={branches ?? []} />
    </div>
  );
}
