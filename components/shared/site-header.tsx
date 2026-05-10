import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogoWide } from "@/components/shared/logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <LogoWide href="/" height={32} />

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/program"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Program
          </Link>
          <Link
            href="/tentang"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Tentang
          </Link>
          <Link
            href="/kontak"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Kontak
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Masuk
          </Link>
          <Link
            href="/daftar/member"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            Daftar
          </Link>
        </div>
      </div>
    </header>
  );
}
