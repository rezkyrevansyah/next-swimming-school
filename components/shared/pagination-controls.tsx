import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 10;

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  pageSize: number;
  buildUrl: (overrides: Record<string, string | undefined>) => string;
}

export function PaginationControls({ page, totalPages, pageSize, buildUrl }: PaginationControlsProps) {
  if (totalPages <= 1 && pageSize === DEFAULT_PAGE_SIZE) return null;

  return (
    <div className="flex items-center justify-between text-sm gap-4 flex-wrap">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Tampilkan</span>
        <div className="flex gap-1">
          {PAGE_SIZE_OPTIONS.map((size) => (
            <Link
              key={size}
              href={buildUrl({ limit: String(size), page: "1" })}
              className={cn(
                "inline-flex items-center justify-center h-7 min-w-7 px-2 rounded border text-xs font-medium transition-colors",
                pageSize === size
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-input hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {size}
            </Link>
          ))}
        </div>
        <span>baris</span>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Hal. {page} / {totalPages}</span>
          <Link
            href={buildUrl({ page: String(page - 1) })}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              page <= 1 && "pointer-events-none opacity-50"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <Link
            href={buildUrl({ page: String(page + 1) })}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-sm" }),
              page >= totalPages && "pointer-events-none opacity-50"
            )}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
