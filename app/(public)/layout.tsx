import { Suspense } from "react";
import { SiteHeader } from "@/components/shared/site-header";
import { PublicFooter } from "@/components/shared/public-footer";
import { PageTransition } from "@/components/shared/page-transition";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div style={{ height: 68 }} />}>
        <SiteHeader />
      </Suspense>
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <PublicFooter />
    </>
  );
}
