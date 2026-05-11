"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  memberId: string;
  memberCode: string;
  fullName: string;
  /** compact: used inline in admin detail tab (no extra padding, smaller buttons) */
  compact?: boolean;
}

export function MemberQrCard({ memberId, memberCode, fullName, compact }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, memberId, {
      width: 200,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then(() => setReady(true));
  }, [memberId]);

  function handleDownload() {
    if (!canvasRef.current) return;
    // Compose a larger canvas with name + code below QR
    const src = canvasRef.current;
    const padding = 24;
    const labelH = 52;
    const out = document.createElement("canvas");
    out.width = src.width + padding * 2;
    out.height = src.height + labelH + padding * 2;
    const ctx = out.getContext("2d")!;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(src, padding, padding);

    ctx.fillStyle = "#111111";
    ctx.textAlign = "center";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(fullName, out.width / 2, src.height + padding + 20);
    ctx.font = "12px monospace";
    ctx.fillStyle = "#666666";
    ctx.fillText(memberCode, out.width / 2, src.height + padding + 38);

    const link = document.createElement("a");
    link.download = `qr-${memberCode}.png`;
    link.href = out.toDataURL("image/png");
    link.click();
  }

  function handlePrint() {
    if (!canvasRef.current) return;
    const src = canvasRef.current;
    const dataUrl = src.toDataURL("image/png");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>QR - ${memberCode}</title>
      <style>
        body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
        img { width: 200px; height: 200px; }
        .name { font-size: 16px; font-weight: bold; margin-top: 8px; }
        .code { font-size: 13px; color: #666; font-family: monospace; margin-top: 4px; }
        @media print { body { margin: 0; } }
      </style></head>
      <body>
        <img src="${dataUrl}" alt="QR Code" />
        <div class="name">${fullName}</div>
        <div class="code">${memberCode}</div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body></html>
    `);
    win.document.close();
  }

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <div className="flex justify-center">
        <div className="rounded-xl border bg-white p-3 inline-block">
          <canvas ref={canvasRef} className={ready ? "block" : "opacity-0"} />
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground font-mono">{memberCode}</p>
      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={handleDownload}
          disabled={!ready}
        >
          <Download className="h-4 w-4 mr-1.5" />
          Unduh
        </Button>
        <Button
          variant="outline"
          size={compact ? "sm" : "default"}
          onClick={handlePrint}
          disabled={!ready}
        >
          <Printer className="h-4 w-4 mr-1.5" />
          Print
        </Button>
      </div>
    </div>
  );
}
