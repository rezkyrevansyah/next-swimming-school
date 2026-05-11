"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  onCapture: (base64: string) => void;
  onClear: () => void;
  captured: string | null;
}

export function CameraCapture({ onCapture, onClear, captured }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
      }
    } catch {
      setError("Kamera tidak dapat diakses. Pastikan izin kamera sudah diberikan.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsStreaming(false);
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    // Center-crop
    const offsetX = (video.videoWidth - size) / 2;
    const offsetY = (video.videoHeight - size) / 2;
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, size, size);
    const base64 = canvas.toDataURL("image/jpeg", 0.7);
    stopCamera();
    onCapture(base64);
  }, [stopCamera, onCapture]);

  const reset = useCallback(() => {
    onClear();
  }, [onClear]);

  // Captured: show preview
  if (captured) {
    return (
      <div className="space-y-3">
        <div className="relative rounded-xl overflow-hidden aspect-square max-w-xs mx-auto border-2 border-green-400">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={captured} alt="Selfie" className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
            <Check className="h-4 w-4" />
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={reset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Ambil Ulang
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Video preview */}
      <div className={cn(
        "relative rounded-xl overflow-hidden aspect-square max-w-xs mx-auto border bg-muted",
        !isStreaming && "flex items-center justify-center"
      )}>
        <video
          ref={videoRef}
          className={cn("w-full h-full object-cover", !isStreaming && "hidden")}
          playsInline
          muted
        />
        {!isStreaming && (
          <div className="text-center p-4">
            <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Kamera belum aktif</p>
          </div>
        )}
        {/* Viewfinder overlay */}
        {isStreaming && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-4 rounded-full border-2 border-white/50" />
          </div>
        )}
      </div>

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <p className="text-sm text-destructive text-center">{error}</p>
      )}

      {!isStreaming ? (
        <Button className="w-full" onClick={startCamera}>
          <Camera className="h-4 w-4 mr-2" />
          Aktifkan Kamera
        </Button>
      ) : (
        <Button className="w-full" onClick={capture}>
          <Camera className="h-4 w-4 mr-2" />
          Ambil Foto
        </Button>
      )}
    </div>
  );
}
