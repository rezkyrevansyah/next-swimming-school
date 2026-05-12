import { SiteHeader } from "@/components/shared/site-header";
import { PublicFooter } from "@/components/shared/public-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </>
  );
}
