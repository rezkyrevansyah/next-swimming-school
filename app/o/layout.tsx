import { Suspense } from "react";
import { OwnerSidebar } from "@/components/shared/owner-sidebar";

function SidebarFallback() {
  return (
    <aside className="hidden md:flex flex-col w-56 border-r bg-background shrink-0 animate-pulse">
      <div className="flex items-center h-14 px-4 border-b gap-2">
        <div className="h-9 w-9 rounded-full bg-muted shrink-0" />
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 bg-muted rounded-md mx-1" />
        ))}
      </nav>
    </aside>
  );
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Suspense fallback={<SidebarFallback />}>
        <OwnerSidebar />
      </Suspense>
      <main className="flex-1 overflow-y-auto animate-[--animate-page-in]">{children}</main>
    </div>
  );
}
