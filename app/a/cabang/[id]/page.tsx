import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BranchEditForm } from "./branch-edit-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CabangDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createClient(await cookies());

  const { data: roleData } = await supabase.rpc("user_role");
  if (roleData !== "owner") redirect("/a/dashboard");

  const { data: branch, error } = await supabase
    .from("branches")
    .select("id, name, slug, address, contact_phone, contact_email, location_lat, location_lng, status, is_default")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error || !branch) notFound();

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-start gap-3">
        <Link href="/a/cabang" className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
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
