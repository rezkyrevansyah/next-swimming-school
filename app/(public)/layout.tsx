import { Suspense } from "react";
import { SiteHeader } from "@/components/shared/site-header";
import { PublicFooter } from "@/components/shared/public-footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div className="h-16 border-b bg-white" />}>
        <SiteHeader />
      </Suspense>
      <main className="flex-1">{children}</main>
      <Suspense fallback={<div className="h-40 border-t bg-white mt-16" />}>
        <PublicFooter />
      </Suspense>
    </>
  );
}
