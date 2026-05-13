"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { Eye, EyeOff, ArrowRight, MessageCircle, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/schemas/auth";
import { signIn } from "@/lib/actions/auth";

const HERO_IMG = "https://images.unsplash.com/photo-1720553900212-78817a04ded4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1200";
const WA_NUMBER = process.env.NEXT_PUBLIC_WA_NUMBER ?? "6281234567890";

export function LoginSplitScreen() {
  const [showPass, setShowPass] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  function onSubmit(values: LoginInput) {
    setServerError(null);
    const fd = new FormData();
    fd.set("email", values.email);
    fd.set("password", values.password);
    startTransition(async () => {
      const result = await signIn(fd);
      if (result?.error) setServerError(result.error);
    });
  }

  const inputBase: React.CSSProperties = {
    width: "100%", height: 48, padding: "0 16px",
    border: "1px solid #CBD5E1", borderRadius: 12,
    fontSize: 15, color: "#1E293B", outline: "none",
    boxSizing: "border-box", backgroundColor: "white",
    fontFamily: "'Inter', system-ui, sans-serif",
    transition: "border-color 160ms, box-shadow 160ms",
  };

  const inputError: React.CSSProperties = { ...inputBase, border: "1px solid #EF4444" };

  return (
    <div style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif", minHeight: "100vh", display: "flex", backgroundColor: "#F8FAFC" }}>

      {/* ── Left hero (desktop only) ── */}
      <div className="hidden lg:block" style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <Image src={HERO_IMG} alt="Kolam renang Next Swimming School" fill style={{ objectFit: "cover" }} priority />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(10,37,71,0.88) 0%, rgba(30,93,184,0.50) 100%)" }} />
        <div style={{ position: "absolute", top: "15%", right: "18%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.10) 0%, transparent 70%)" }} />

        <div style={{ position: "absolute", inset: 0, padding: 56, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <Image src="/logo-circle.png" alt="Next Swimming School" width={40} height={40} className="shrink-0" />
            <span style={{ fontSize: 16, fontWeight: 800, color: "white", fontFamily: "var(--font-jakarta, sans-serif)" }}>Next Swimming School</span>
          </Link>

          {/* Tagline */}
          <div>
            <div style={{ height: 3, width: 32, backgroundColor: "#22D3EE", borderRadius: 9999, marginBottom: 20 }} />
            <p style={{ fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 900, color: "white", lineHeight: 1.15, letterSpacing: "-0.025em", marginBottom: 12, fontFamily: "var(--font-jakarta, sans-serif)" }}>
              &quot;Berenang Lebih Baik,<br />Dimulai dari Sini.&quot;
            </p>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", marginBottom: 28 }}>
              Bergabung dengan 500+ member aktif kami
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["⭐ Rating 4.9", "✓ 20+ Coach", "✓ 3 Cabang"].map((t) => (
                <div key={t} style={{ padding: "6px 14px", backgroundColor: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 9999, fontSize: 12, fontWeight: 700, color: "white", backdropFilter: "blur(8px)" }}>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form ── */}
      <div style={{ width: "100%", maxWidth: 480, display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(24px,5vw,56px)", backgroundColor: "white", minHeight: "100vh", boxShadow: "-1px 0 0 #E2E8F0" }}>

        {/* Mobile logo */}
        <div className="lg:hidden" style={{ marginBottom: 36 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <Image src="/logo-circle.png" alt="Next Swimming School" width={36} height={36} className="shrink-0" />
            <span style={{ fontSize: 15, fontWeight: 800, color: "#0F172A", fontFamily: "var(--font-jakarta, sans-serif)" }}>Next Swimming School</span>
          </Link>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: "clamp(24px,4vw,34px)", fontWeight: 900, color: "#0F172A", letterSpacing: "-0.025em", marginBottom: 6, fontFamily: "var(--font-jakarta, sans-serif)" }}>
            Selamat Datang<br />Kembali 👋
          </h1>
          <p style={{ fontSize: 15, color: "#64748B" }}>Login untuk mengakses dashboardmu</p>
        </div>

        {/* Error banner */}
        {(serverError || errors.email?.message || errors.password?.message) && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, marginBottom: 20 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#EF4444", flexShrink: 0 }} />
            <p style={{ fontSize: 14, color: "#DC2626", margin: 0 }}>
              {serverError ?? errors.email?.message ?? errors.password?.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 18 }} noValidate>
          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 700, color: "#334155", marginBottom: 8 }}>Email</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="email@contoh.com"
              style={errors.email ? inputError : inputBase}
              {...register("email")}
            />
          </div>

          {/* Password */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <label style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>Password</label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                style={{ fontSize: 13, color: "#1E5DB8", fontWeight: 600, background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
              >
                Lupa password?
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Password kamu"
                style={{ ...(errors.password ? inputError : inputBase), paddingRight: 48 }}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8" }}
                aria-label={showPass ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            style={{ height: 52, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 15, fontWeight: 800, color: "white", border: "none", borderRadius: 14, backgroundColor: isPending ? "#5F9BFA" : "#1E5DB8", cursor: isPending ? "not-allowed" : "pointer", transition: "background 150ms", boxShadow: "0 4px 12px rgba(30,93,184,0.22)", fontFamily: "var(--font-jakarta, sans-serif)" }}
          >
            {isPending ? (
              <>
                <span style={{ width: 17, height: 17, border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                Memproses...
              </>
            ) : (
              <>Masuk <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "24px 0" }}>
          <div style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
          <span style={{ fontSize: 13, color: "#94A3B8" }}>atau</span>
          <div style={{ flex: 1, height: 1, backgroundColor: "#E2E8F0" }} />
        </div>

        <p style={{ textAlign: "center", fontSize: 15, color: "#64748B" }}>
          Belum punya akun?{" "}
          <Link href="/daftar/member" style={{ color: "#1E5DB8", fontWeight: 700, textDecoration: "none" }}>
            Daftar Sekarang
          </Link>
        </p>
      </div>

      {/* ── Forgot Password Modal ── */}
      {showForgot && (
        <>
          <div
            onClick={() => setShowForgot(false)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15,23,42,0.5)", zIndex: 100, backdropFilter: "blur(4px)" }}
          />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 101, backgroundColor: "white", borderRadius: 24, padding: 32, maxWidth: 420, width: "calc(100% - 32px)", boxShadow: "0 24px 64px rgba(15,23,42,0.16)", border: "1px solid #E2E8F0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h3 style={{ fontSize: 19, fontWeight: 800, color: "#0F172A", margin: 0, fontFamily: "var(--font-jakarta, sans-serif)" }}>Lupa Password?</h3>
              <button
                onClick={() => setShowForgot(false)}
                style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B" }}
                aria-label="Tutup"
              >
                <X size={15} />
              </button>
            </div>
            <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, marginBottom: 22 }}>
              Hubungi admin untuk reset password kamu. Admin akan memberikan password baru via WhatsApp dalam 1×24 jam.
            </p>
            <a
              href={`https://wa.me/${WA_NUMBER.replace(/\D/g, "")}?text=Halo%2C+saya+lupa+password+akun+Next+Swimming+School`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, height: 48, fontSize: 14, fontWeight: 700, color: "white", textDecoration: "none", backgroundColor: "#10B981", borderRadius: 12 }}
            >
              <MessageCircle size={17} /> Hubungi Admin via WA
            </a>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
