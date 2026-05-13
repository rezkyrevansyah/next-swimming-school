"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/", label: "Beranda" },
  { href: "/program", label: "Program" },
  { href: "/tentang", label: "Tentang" },
  { href: "/kontak", label: "Kontak" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
        style={{
          height: 68,
          backgroundColor: scrolled ? "rgba(255,255,255,0.98)" : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: `1px solid ${scrolled ? "#E2E8F0" : "transparent"}`,
          boxShadow: scrolled ? "0 4px 12px rgba(15,23,42,0.06)" : "none",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <Image
              src="/logo-circle.png"
              alt="Next Swimming School"
              width={44}
              height={44}
              className="shrink-0"
              priority
            />
            <div className="leading-none">
              <div
                className="text-[15px] font-extrabold tracking-tight"
                style={{ color: "#0F172A", fontFamily: "var(--font-jakarta, sans-serif)" }}
              >
                Next Swimming
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "#06B6D4" }}>
                School
              </div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="relative px-3.5 py-2 text-sm font-semibold rounded-[10px] transition-colors duration-150 no-underline"
                style={{ color: isActive(href) ? "#1E5DB8" : "#475569" }}
              >
                {label}
                {isActive(href) && (
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 block"
                    style={{ width: 20, height: 3, backgroundColor: "#22D3EE", borderRadius: 9999 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex items-center px-4 h-10 text-sm font-semibold rounded-xl border no-underline transition-colors"
              style={{ color: "#475569", borderColor: "#E2E8F0", backgroundColor: "white" }}
            >
              Masuk
            </Link>
            <Link
              href="/daftar/member"
              className="inline-flex items-center px-5 h-10 text-sm font-bold rounded-xl no-underline"
              style={{ color: "white", backgroundColor: "#1E5DB8", boxShadow: "0 4px 12px rgba(30,93,184,0.22)" }}
            >
              Daftar Sekarang
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden flex items-center justify-center rounded-[10px] border"
            style={{ width: 40, height: 40, borderColor: "#E2E8F0", backgroundColor: "white", color: "#334155" }}
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div style={{ height: 68 }} aria-hidden />

      {/* Mobile backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50"
          style={{ backgroundColor: "rgba(15,23,42,0.45)", backdropFilter: "blur(4px)" }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
        style={{
          width: "80%", maxWidth: 320,
          backgroundColor: "white",
          boxShadow: "-16px 0 40px rgba(15,23,42,0.12)",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(0.16,1,0.3,1)",
          padding: 24,
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-circle.png"
              alt="Next Swimming School"
              width={36}
              height={36}
              className="shrink-0"
            />
            <span
              className="text-sm font-extrabold"
              style={{ color: "#0F172A", fontFamily: "var(--font-jakarta, sans-serif)" }}
            >
              Next Swimming
            </span>
          </div>
          <button onClick={() => setDrawerOpen(false)} style={{ color: "#64748B" }} aria-label="Tutup menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-0.5 flex-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl text-[15px] font-semibold no-underline transition-colors"
              style={{
                color: isActive(href) ? "#1E5DB8" : "#334155",
                backgroundColor: isActive(href) ? "#EEF5FF" : "transparent",
              }}
            >
              {isActive(href) && (
                <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#22D3EE", flexShrink: 0 }} />
              )}
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-2 mt-6">
          <Link
            href="/login"
            className="flex items-center justify-center h-12 text-sm font-bold rounded-xl border no-underline"
            style={{ color: "#1E5DB8", borderColor: "#B8D6FF", backgroundColor: "#EEF5FF" }}
          >
            Masuk
          </Link>
          <Link
            href="/daftar/member"
            className="flex items-center justify-center h-12 text-sm font-bold rounded-xl no-underline"
            style={{ color: "white", backgroundColor: "#1E5DB8" }}
          >
            Daftar Sekarang
          </Link>
        </div>
      </div>
    </>
  );
}
