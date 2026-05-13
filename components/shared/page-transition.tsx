"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const key = useRef(0);
  const prevPath = useRef(pathname);

  if (prevPath.current !== pathname) {
    prevPath.current = pathname;
    key.current += 1;
  }

  return (
    <div key={key.current} style={{ animation: "pageIn 0.22s ease-out both" }}>
      {children}
      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
