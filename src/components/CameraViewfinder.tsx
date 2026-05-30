import React, { useState, useEffect } from 'react';
import { MapPin, Clock } from 'lucide-react';
import { SafetySession } from '../types';

const SCENIC_PHOTOS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80',
  'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=400&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&q=80',
  'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=400&q=80',
];

function formatCountdown(secs: number): string {
  if (secs <= 0) return 'overdue';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface Props {
  session: SafetySession | null;
  onCapture: (photoUrl: string) => void;
}

export default function CameraViewfinder({ session, onCapture }: Props) {
  const [photoIdx, setPhotoIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setPhotoIdx(i => (i + 1) % SCENIC_PHOTOS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="relative w-full flex-1 overflow-hidden rounded-[28px]"
      style={{ minHeight: 0 }}
    >
      {/* Simulated viewfinder */}
      <img
        key={photoIdx}
        src={SCENIC_PHOTOS[photoIdx]}
        alt="viewfinder"
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
      />

      {/* Top overlay: location + timer */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-start justify-between">
        <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <MapPin className="w-3 h-3 text-white" />
          <span className="text-white text-[11px] font-medium">
            {session?.approximateRegion ?? 'near Wollongong'}
          </span>
        </div>

        {session?.isActive && (
          <div className="flex items-center gap-1.5 bg-forest/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Clock className="w-3 h-3 text-yellow-orange" />
            <span className="text-yellow-orange text-[11px] font-semibold">
              {formatCountdown(session.secondsRemaining)}
            </span>
          </div>
        )}
      </div>

      {/* Shutter button */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <button
          onClick={() => onCapture(SCENIC_PHOTOS[photoIdx])}
          className="w-16 h-16 rounded-full bg-white border-4 border-white/50 shadow-xl active:scale-95 transition-transform"
          aria-label="Take photo"
        >
          <div className="w-full h-full rounded-full bg-white border-2 border-forest/10" />
        </button>
      </div>
    </div>
  );
}
