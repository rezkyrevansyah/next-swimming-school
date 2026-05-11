"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LogoWide } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/program", label: "Program" },
  { href: "/tentang", label: "Tentang" },
  { href: "/kontak", label: "Kontak" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto flex h-14 items-center justify-between px-5">
        <LogoWide href="/" height={30} />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "text-gray-900 bg-gray-100"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-gray-600")}
          >
            Masuk
          </Link>
          <Link
            href="/daftar/member"
            className={cn(buttonVariants({ size: "sm" }), "rounded-full px-5")}
          >
            Daftar
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center h-9 w-9 rounded-md hover:bg-gray-100 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t bg-white px-5 py-4 space-y-1" onClick={() => setOpen(false)}>
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith(href)
                  ? "text-gray-900 bg-gray-100"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {label}
            </Link>
          ))}
          <div className="pt-3 border-t mt-3 flex flex-col gap-2">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-full justify-center")}
            >
              Masuk
            </Link>
            <Link
              href="/daftar/member"
              className={cn(buttonVariants({ size: "sm" }), "w-full justify-center rounded-full")}
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
