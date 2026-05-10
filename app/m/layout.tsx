import { MemberBottomNav } from "@/components/shared/member-bottom-nav";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 pb-16">{children}</main>
      <MemberBottomNav />
    </div>
  );
}
