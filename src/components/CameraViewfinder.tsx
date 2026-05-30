import React, { useEffect, useRef, useState } from 'react';
import { Camera, MapPin, RefreshCw } from 'lucide-react';

interface CameraViewfinderProps {
  locationLabel?: string;
  onCapture: (photoUrl: string) => void;
}

export default function CameraViewfinder({
  locationLabel = 'place tag',
  onCapture,
}: CameraViewfinderProps) {
  const [isReady, setIsReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [message, setMessage] = useState('Camera ready');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let disposed = false;

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage('Camera unavailable');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (disposed) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsReady(true);
          setMessage('Camera ready');
        }
      } catch {
        setMessage('Camera permission needed');
      }
    };

    startCamera();

    return () => {
      disposed = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!isReady || !video || !canvas || video.videoWidth <= 0) {
      setMessage('Camera permission needed');
      return;
    }

    setIsCapturing(true);
    window.setTimeout(() => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
      onCapture(canvas.toDataURL('image/jpeg', 0.92));
      setIsCapturing(false);
    }, 420);
  };

  return (
    <section className="lmk-shell lmk-story-card relative z-10 flex flex-1 overflow-hidden rounded-[38px] bg-brand-black shadow-[0_20px_46px_rgba(18,66,36,0.16)]">
      <video
        ref={videoRef}
        playsInline
        muted
        className={`absolute inset-0 h-full w-full object-cover ${isReady ? 'block' : 'hidden'}`}
      />
      <canvas ref={canvasRef} className="hidden" />

      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#cce6fc] px-8 text-center">
          <div className="mb-5 flex h-16 w-20 items-center justify-center rounded-full bg-yellow-orange text-brand-black shadow-sm">
            <Camera className="h-7 w-7" />
          </div>
          <p className="text-[28px] font-black text-brand-black">Camera only</p>
          <p className="mt-3 max-w-[220px] text-sm font-medium text-brand-black">
            LMK only posts photos taken right now.
          </p>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white">
        <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-black backdrop-blur">
          <MapPin className="h-3.5 w-3.5 text-yellow-orange" />
          {locationLabel}
        </span>
        <span className="rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-black text-brand-black">
          {message}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="mb-5 flex justify-center">
          <button
            type="button"
            onClick={handleCapture}
            disabled={!isReady}
            className="lmk-snap flex h-22 w-22 items-center justify-center rounded-full border-[7px] border-white bg-yellow-orange text-brand-black shadow-lg disabled:bg-white/55 disabled:text-brand-black/60"
            aria-label="Snap photo"
          >
            <Camera className="h-8 w-8" />
          </button>
        </div>
      </div>

      {isCapturing && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90">
          <RefreshCw className="mb-2 h-8 w-8 animate-spin text-forest" />
          <span className="text-xs font-black text-forest">snapping...</span>
        </div>
      )}
    </section>
  );
}
