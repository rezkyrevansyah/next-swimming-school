import { Suspense } from "react";
import { createAdminClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BranchEditForm } from "@/app/a/cabang/[id]/branch-edit-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OwnerCabangDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="p-6 max-w-2xl space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-muted rounded" />
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    }>
      <CabangDetailContent params={params} />
    </Suspense>
  );
}

async function CabangDetailContent({ params }: PageProps) {
  const { id } = await params;
  const db = createAdminClient();

  const { data: branch, error } = await db
    .from("branches")
    .select("id, name, slug, address, contact_phone, contact_email, location_lat, location_lng, status, is_default")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !branch) notFound();

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-start gap-3">
        <Link href="/o/cabang" className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold">{branch.name}</h1>
            {branch.is_default && (
              <Badge variant="secondary">Cabang Utama</Badge>
            )}
            <Badge variant={branch.status === "active" ? "default" : "outline"}>
              {branch.status === "active" ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>
          {branch.address && (
            <p className="text-sm text-muted-foreground mt-0.5">{branch.address}</p>
          )}
        </div>
      </div>

      <BranchEditForm branch={branch} />
    </div>
  );
}
