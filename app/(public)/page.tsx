import { LogoWide } from "@/components/shared/logo";

export default function LandingPage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4 text-center">
      <LogoWide height={56} />
      <p className="text-muted-foreground text-lg max-w-md">
        Sistem manajemen sekolah renang modern. Halaman publik segera hadir.
      </p>
    </section>
  );
}
