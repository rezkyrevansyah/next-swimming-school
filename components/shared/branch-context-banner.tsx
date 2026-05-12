"use client";

import { ArrowLeft, Building2 } from "lucide-react";
import { clearActiveBranch } from "@/lib/actions/branch";

interface BranchContextBannerProps {
  branchName: string;
}

export function BranchContextBanner({ branchName }: BranchContextBannerProps) {
  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-2 text-amber-800">
        <Building2 className="h-4 w-4 shrink-0" />
        <span className="text-sm font-medium">
          Mode Admin —{" "}
          <span className="font-semibold">{branchName}</span>
        </span>
      </div>
      <form action={clearActiveBranch}>
        <button
          type="submit"
          className="flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Owner Panel
        </button>
      </form>
    </div>
  );
}
