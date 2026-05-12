"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  coachId: string;
  coachCode: string;
  fullName: string;
}

export function CoachQrCard({ coachId, coachCode, fullName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, coachId, {
      width: 240,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then(() => setReady(true));
  }, [coachId]);

  function handleDownload() {
    if (!canvasRef.current) return;
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
    ctx.fillText(coachCode, out.width / 2, src.height + padding + 38);
    const link = document.createElement("a");
    link.download = `qr-pelatih-${coachCode}.png`;
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
      <html><head><title>QR - ${coachCode}</title>
      <style>
        body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: sans-serif; }
        img { width: 240px; height: 240px; }
        .name { font-size: 16px; font-weight: bold; margin-top: 8px; }
        .code { font-size: 13px; color: #666; font-family: monospace; margin-top: 4px; }
        @media print { body { margin: 0; } }
      </style></head>
      <body>
        <img src="${dataUrl}" alt="QR Code" />
        <div class="name">${fullName}</div>
        <div class="code">${coachCode}</div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body></html>
    `);
    win.document.close();
  }

  return (
    <div className="space-y-4 text-center">
      <div className="flex justify-center">
        <div className="rounded-2xl border bg-white p-4 inline-block shadow-sm">
          <canvas ref={canvasRef} className={ready ? "block" : "opacity-0"} />
        </div>
      </div>
      <div className="flex gap-2 justify-center">
        <Button variant="outline" size="sm" onClick={handleDownload} disabled={!ready}>
          <Download className="h-4 w-4 mr-1.5" />
          Unduh
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint} disabled={!ready}>
          <Printer className="h-4 w-4 mr-1.5" />
          Print
        </Button>
      </div>
    </div>
  );
}
