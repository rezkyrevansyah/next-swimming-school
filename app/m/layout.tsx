import { MemberBottomNav } from "@/components/shared/member-bottom-nav";
import { LogoCircle } from "@/components/shared/logo";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut, QrCode } from "lucide-react";
import Link from "next/link";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4">
        <LogoCircle href="/m/dashboard" size={32} />
        <div className="flex items-center gap-1">
          <Link
            href="/m/qr"
            className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-accent transition-colors"
            aria-label="Tampilkan QR"
          >
            <QrCode className="h-4 w-4" />
          </Link>
          <form action={signOut}>
            <Button variant="ghost" size="icon-sm" type="submit" aria-label="Keluar">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </header>

      <main className="flex-1 pb-16 animate-[--animate-page-in]">{children}</main>
      <MemberBottomNav />
    </div>
  );
}
