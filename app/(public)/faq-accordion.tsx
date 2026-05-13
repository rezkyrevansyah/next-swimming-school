"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

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
      {faqs.map((faq, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            style={{ borderBottom: i < faqs.length - 1 ? "1px solid #E2E8F0" : "none" }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
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
                  color: isOpen ? "#1E5DB8" : "#0F172A",
                  lineHeight: 1.4,
                  transition: "color 0.2s ease",
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
                  backgroundColor: isOpen ? "#EEF5FF" : "#F1F5F9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.2s ease",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    transition: "transform 0.25s ease",
                    transform: isOpen ? "rotate(0deg)" : "rotate(0deg)",
                  }}
                >
                  {isOpen
                    ? <Minus size={13} color="#1E5DB8" />
                    : <Plus size={13} color="#64748B" />
                  }
                </span>
              </span>
            </button>

            {/* grid trick: 0fr → 1fr animates height smoothly without JS measurement */}
            <div
              style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: "grid-template-rows 0.28s ease",
              }}
            >
              <div style={{ overflow: "hidden" }}>
                <div
                  style={{
                    padding: "0 24px 20px",
                    fontSize: 14,
                    color: "#475569",
                    lineHeight: 1.65,
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? "translateY(0)" : "translateY(-6px)",
                    transition: "opacity 0.22s ease 0.06s, transform 0.22s ease 0.06s",
                  }}
                >
                  {faq.a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
