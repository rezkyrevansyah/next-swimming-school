import { Suspense } from "react";
import { CoachBottomNav } from "@/components/shared/coach-bottom-nav";
import { LogoCircle } from "@/components/shared/logo";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4">
        <LogoCircle href="/c/dashboard" size={32} />
        <form action={signOut}>
          <Button variant="ghost" size="icon-sm" type="submit" aria-label="Keluar">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </header>

      <main className="flex-1 pb-16 animate-[--animate-page-in]">{children}</main>
      <Suspense fallback={<div className="h-16 border-t bg-background" />}>
        <CoachBottomNav />
      </Suspense>
    </div>
  );
}
