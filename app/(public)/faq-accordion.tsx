"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface FaqAccordionProps {
  faqs: { q: string; a: string }[];
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div
      style={{
        backgroundColor: "white",
        border: "1px solid #E2E8F0",
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(15,23,42,0.06)",
      }}
    >
      {faqs.map((faq, i) => (
        <div
          key={i}
          style={{ borderBottom: i < faqs.length - 1 ? "1px solid #E2E8F0" : "none" }}
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              padding: "20px 24px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: open === i ? "#1E5DB8" : "#0F172A",
                lineHeight: 1.4,
              }}
            >
              {faq.q}
            </span>
            <span
              style={{
                flexShrink: 0,
                width: 26,
                height: 26,
                borderRadius: 8,
                backgroundColor: open === i ? "#EEF5FF" : "#F1F5F9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {open === i
                ? <X size={13} color="#1E5DB8" />
                : <Plus size={13} color="#64748B" />
              }
            </span>
          </button>
          {open === i && (
            <div
              style={{
                padding: "0 24px 20px",
                fontSize: 14,
                color: "#475569",
                lineHeight: 1.65,
              }}
            >
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
