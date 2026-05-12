import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CreateBranchForm } from "./create-branch-form";

export default function CabangBaruPage() {
  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/o/cabang" className={buttonVariants({ variant: "ghost", size: "icon-sm" })}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Cabang Baru</h1>
          <p className="text-sm text-muted-foreground">Tambahkan cabang baru ke sistem</p>
        </div>
      </div>

      <Suspense>
        <CreateBranchForm />
      </Suspense>
    </div>
  );
}
