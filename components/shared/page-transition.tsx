"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [{ key, prevPath }, setState] = useState({ key: 0, prevPath: pathname });

  if (prevPath !== pathname) {
    setState((s) => ({ key: s.key + 1, prevPath: pathname }));
  }

  return (
    <div key={key} style={{ animation: "pageIn 0.22s ease-out both" }}>
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
