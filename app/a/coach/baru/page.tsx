import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CreateCoachForm } from "./create-coach-form";

function PageSkeleton() {
  return (
    <div className="p-6 max-w-2xl space-y-6 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 bg-muted rounded" />
        <div className="space-y-1">
          <div className="h-6 w-36 bg-muted rounded" />
          <div className="h-4 w-56 bg-muted rounded" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-4 w-24 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        ))}
        <div className="h-10 w-full bg-muted rounded mt-2" />
      </div>
    </div>
  );
}

async function PageContent() {
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

export default function CreateCoachPage() {
  return (
    <div>
      <Suspense fallback={<PageSkeleton />}>
        <PageContent />
      </Suspense>
    </div>
  );
}
