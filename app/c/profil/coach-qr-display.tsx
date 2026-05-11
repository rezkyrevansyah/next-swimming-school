"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  coachCode: string;
  coachName: string;
}

export function CoachQrDisplay({ coachCode, coachName }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, coachCode, {
      width: 180,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then(() => setReady(true));
  }, [coachCode]);

  function handleDownload() {
    if (!canvasRef.current) return;
    const src = canvasRef.current;
    const padding = 16;
    const labelH = 44;
    const out = document.createElement("canvas");
    out.width = src.width + padding * 2;
    out.height = src.height + labelH + padding * 2;
    const ctx = out.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(src, padding, padding);
    ctx.fillStyle = "#111111";
    ctx.textAlign = "center";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(coachName, out.width / 2, src.height + padding + 18);
    ctx.font = "11px monospace";
    ctx.fillStyle = "#666666";
    ctx.fillText(coachCode, out.width / 2, src.height + padding + 34);
    const link = document.createElement("a");
    link.download = `qr-pelatih-${coachCode}.png`;
    link.href = out.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="space-y-3 text-center">
      <div className="rounded-xl border bg-white p-3 inline-block">
        <canvas ref={canvasRef} className={ready ? "block" : "opacity-0"} />
      </div>
      <p className="text-xs text-muted-foreground font-mono">{coachCode}</p>
      <Button variant="outline" size="sm" onClick={handleDownload} disabled={!ready}>
        <Download className="h-4 w-4 mr-1.5" />
        Unduh QR
      </Button>
    </div>
  );
}
