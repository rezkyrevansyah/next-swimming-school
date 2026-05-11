"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  BookOpen,
  ClipboardList,
  UserPlus,
  GraduationCap,
  LogOut,
  Menu,
  X,
  Building2,
  ShieldCheck,
  Crown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { LogoCircle } from "@/components/shared/logo";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  exclude?: string[];
  ownerOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/a/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/a/member/registrasi", label: "Registrasi", icon: UserPlus, exact: true },
  { href: "/a/member", label: "Anggota", icon: Users, exclude: ["/a/member/registrasi"] },
  { href: "/a/coach", label: "Pelatih", icon: UserCheck },
  { href: "/a/kelas", label: "Kelas", icon: BookOpen },
  { href: "/a/absensi", label: "Absensi", icon: ClipboardList },
  { href: "/a/semester", label: "Semester", icon: GraduationCap },
];

const OWNER_ITEMS: NavItem[] = [
  { href: "/a/admin", label: "Kelola Admin", icon: ShieldCheck, ownerOnly: true },
  { href: "/a/cabang", label: "Cabang", icon: Building2, ownerOnly: true },
];

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isOwner = role === "owner";

  const allItems = isOwner ? [...NAV_ITEMS, ...OWNER_ITEMS] : NAV_ITEMS;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b">
        <LogoCircle href="/a/dashboard" size={36} />
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
        {/* Shared menu items */}
        {allItems.filter((item) => !item.ownerOnly).map(({ href, label, icon: Icon, exact, exclude }) => {
          const isExcluded = exclude?.some((ex) => pathname === ex || pathname.startsWith(ex + "/"));
          const isActive = !isExcluded && (exact ? pathname === href : pathname === href || pathname.startsWith(href + "/"));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}

        {/* Owner-only section */}
        {isOwner && (
          <>
            <div className="pt-3 pb-1 px-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <Crown className="h-3 w-3" />
                Owner
              </div>
            </div>
            {OWNER_ITEMS.map(({ href, label, icon: Icon, exact, exclude }) => {
              const isExcluded = exclude?.some((ex) => pathname === ex || pathname.startsWith(ex + "/"));
              const isActive = !isExcluded && (exact ? pathname === href : pathname === href || pathname.startsWith(href + "/"));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </>
        )}
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
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r bg-background shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile hamburger trigger */}
      <button
        className="md:hidden fixed top-3 left-4 z-40 p-1.5 rounded-md border bg-background"
        onClick={() => setMobileOpen(true)}
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile sidebar overlay */}
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
