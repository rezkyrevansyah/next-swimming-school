"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ScrollText,
  LogOut,
  Menu,
  X,
  Crown,
  Receipt,
  DollarSign,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { LogoCircle } from "@/components/shared/logo";

const NAV_ITEMS = [
  { href: "/o/dashboard", label: "Helicopter View", icon: LayoutDashboard },
  { href: "/o/invoice-coach", label: "Invoice Pelatih", icon: Receipt },
  { href: "/o/tarif-coach", label: "Tarif Pelatih", icon: DollarSign },
  { href: "/o/cabang", label: "Cabang", icon: Building2 },
  { href: "/o/log", label: "Log Aktivitas", icon: ScrollText },
] as const;

export function OwnerSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo + badge */}
      <div className="flex items-center justify-between h-14 px-4 border-b">
        <div className="flex items-center gap-2">
          <LogoCircle href="/o/dashboard" size={32} />
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
            <Crown className="h-3 w-3" />
            Owner
          </span>
        </div>
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Tutup menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-amber-600 text-white"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden md:flex flex-col w-56 border-r bg-background shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile trigger */}
      <button
        className="md:hidden fixed top-3 left-4 z-40 p-1.5 rounded-md border bg-background"
        onClick={() => setMobileOpen(true)}
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed inset-y-0 left-0 z-50 w-56 border-r bg-background">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
