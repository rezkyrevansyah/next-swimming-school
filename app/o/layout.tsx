import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { LogoCircle } from "@/components/shared/logo";
import { LogOut } from "lucide-react";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background px-4">
        <LogoCircle href="/o/dashboard" size={32} />
        <form action={signOut}>
          <Button variant="ghost" size="icon-sm" type="submit" aria-label="Keluar">
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
