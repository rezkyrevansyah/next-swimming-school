"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  memberId: string;
  memberCode: string;
  fullName: string;
  nickname: string | null;
}

export function QrDisplay({ memberId, memberCode, fullName, nickname }: Props) {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, memberId, {
      width: 280,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then(() => setReady(true));
  }, [memberId]);

  // Wake Lock — keep screen on while showing QR
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;
    if ("wakeLock" in navigator) {
      navigator.wakeLock.request("screen").then((wl) => {
        wakeLock = wl;
      }).catch(() => {});
    }
    return () => { wakeLock?.release().catch(() => {}); };
  }, []);

  const displayName = nickname || fullName.split(" ")[0];

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          QR Code Absensi
        </p>
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{displayName}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
            {memberCode}
          </p>
        </div>

        {/* QR Canvas */}
        <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 p-3 bg-white shadow-lg">
          <canvas
            ref={canvasRef}
            className={ready ? "block" : "invisible"}
          />
        </div>

        <p className="text-xs text-center text-zinc-400 dark:text-zinc-500 max-w-xs">
          Tunjukkan QR code ini ke pelatih untuk mencatat kehadiran
        </p>
      </div>
    </div>
  );
}
