"use client";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ animation: "pageIn 0.25s ease-out both" }}>
      {children}
      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
