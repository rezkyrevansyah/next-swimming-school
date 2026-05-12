"use client";

import Link from "next/link";
import { LogoWide } from "@/components/shared/logo";

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-white mt-16">
      <div className="max-w-5xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <LogoWide href="/" height={28} />
            <p className="text-sm text-gray-500 leading-relaxed">
              Sekolah renang profesional dengan pelatih bersertifikat dan program terstruktur.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/program", label: "Program" },
                { href: "/tentang", label: "Tentang Kami" },
                { href: "/kontak", label: "Kontak" },
                { href: "/daftar/member", label: "Daftar Sekarang" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-gray-500 hover:text-gray-900 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Hubungi Kami</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {process.env.NEXT_PUBLIC_WA_NUMBER && (
                <li>
                  <a
                    href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_NUMBER?.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-900 transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
              {process.env.NEXT_PUBLIC_INSTAGRAM && (
                <li>
                  <a
                    href={`https://instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gray-900 transition-colors"
                  >
                    Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-xs text-gray-400">
          &copy; {year} Next Swimming School. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
