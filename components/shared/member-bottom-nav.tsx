"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardList, FileText, UserCheck, UserCircle, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/m/dashboard", label: "Beranda", icon: LayoutDashboard },
  { href: "/m/absensi", label: "Absensi", icon: ClipboardList },
  { href: "/m/rapot", label: "Rapot", icon: FileText },
  { href: "/m/pembayaran", label: "Tagihan", icon: Banknote },
  { href: "/m/coach", label: "Pelatih", icon: UserCheck },
  { href: "/m/profil", label: "Profil", icon: UserCircle },
] as const;

export function MemberBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background safe-area-pb">
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
