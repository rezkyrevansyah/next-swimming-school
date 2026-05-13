import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { MapPin, Phone, Mail, Clock, AtSign, Play, Users } from "lucide-react";
import { FooterYear } from "./footer-year";

const MENU_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/program", label: "Program" },
  { href: "/tentang", label: "Tentang Kami" },
  { href: "/kontak", label: "Kontak" },
  { href: "/daftar/member", label: "Daftar Member" },
];

const PROGRAM_LINKS = [
  "Kelas Beginner",
  "Kelas Intermediate",
  "Kelas Advanced",
  "Kelas Dewasa",
];

const CONTACT_ITEMS = [
  { icon: MapPin, text: "Jl. Sudirman No. 1, Bekasi, Jawa Barat" },
  { icon: Phone, text: "+62 812 3456 7890" },
  { icon: Mail, text: "info@nextswimming.id" },
  { icon: Clock, text: "Senin–Sabtu, 06:00 – 21:00" },
];

const SOCIAL = [
  { icon: AtSign, href: "#", label: "Instagram" },
  { icon: Play, href: "#", label: "YouTube" },
  { icon: Users, href: "#", label: "Facebook" },
];

export function PublicFooter() {
  return (
    <footer style={{ backgroundColor: "#0A2547", fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "64px 24px 40px" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div style={{ maxWidth: 260 }}>
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/logo-circle.png"
                alt="Next Swimming School"
                width={44}
                height={44}
                className="shrink-0"
              />
              <div className="leading-none">
                <div
                  className="text-[15px] font-extrabold"
                  style={{ color: "white", fontFamily: "var(--font-jakarta, sans-serif)" }}
                >
                  Next Swimming
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: "#22D3EE" }}>
                  School
                </div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: "22px", marginBottom: 24 }}>
              Sekolah renang modern dengan kurikulum terstruktur dan pelatih bersertifikat.
            </p>
            <div className="flex gap-2">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex items-center justify-center transition-colors"
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    color: "#94A3B8",
                  }}
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Menu */}
          <div>
            <h4
              className="mb-5"
              style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              Menu
            </h4>
            <ul className="flex flex-col gap-3">
              {MENU_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="transition-colors no-underline"
                    style={{ fontSize: 14, color: "#94A3B8" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4
              className="mb-5"
              style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              Program
            </h4>
            <ul className="flex flex-col gap-3">
              {PROGRAM_LINKS.map((p) => (
                <li key={p}>
                  <Link
                    href="/program"
                    className="transition-colors no-underline"
                    style={{ fontSize: 14, color: "#94A3B8" }}
                  >
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="mb-5"
              style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              Kontak
            </h4>
            <ul className="flex flex-col gap-3.5">
              {CONTACT_ITEMS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex gap-2.5 items-start">
                  <Icon size={15} color="#22D3EE" style={{ marginTop: 2, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "#94A3B8", lineHeight: "20px" }}>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ backgroundColor: "#06182F", padding: "16px 24px" }}>
        <div
          className="flex items-center justify-between flex-wrap gap-2"
          style={{ maxWidth: 1200, margin: "0 auto" }}
        >
          <p style={{ fontSize: 13, color: "#475569", margin: 0 }}>
            © <Suspense fallback={<>2025</>}><FooterYear /></Suspense> Next Swimming School. All rights reserved.
          </p>
          <div className="flex gap-5">
            {["Kebijakan Privasi", "Syarat & Ketentuan"].map((t) => (
              <a key={t} href="#" style={{ fontSize: 13, color: "#475569", textDecoration: "none" }}>{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
