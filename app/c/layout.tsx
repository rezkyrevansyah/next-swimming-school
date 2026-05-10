import { CoachBottomNav } from "@/components/shared/coach-bottom-nav";

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-16">{children}</main>
      <CoachBottomNav />
    </div>
  );
}
