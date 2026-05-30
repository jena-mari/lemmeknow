import React, { useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { CheckIn, SafetySession } from '../types';

const CAPTION_SUGGESTIONS = [
  'at hackathon rn lol',
  'heading home 🚗',
  'late shift done ✌️',
  'grabbing dinner',
  'on my way!',
];

const LOCATION_LABELS: Record<string, string> = {
  precise: 'Central Station, Platform 2',
  approximate: 'near Central, Sydney',
  manual: 'Crown Street, Wollongong',
};

interface Props {
  photoUrl: string;
  session: SafetySession | null;
  onPost: (data: Omit<CheckIn, 'id' | 'timestamp'>) => void;
  onRetake: () => void;
}

export default function CaptionEditor({ photoUrl, session, onPost, onRetake }: Props) {
  const [caption, setCaption] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [plates, setPlates] = useState(session?.transportDetails?.plates ?? '');
  const [vehicle, setVehicle] = useState(session?.transportDetails?.model ?? '');
  const [landmark, setLandmark] = useState(session?.landmark ?? '');

  const locationTier = session?.locationSharingOption ?? 'approximate';
  const locationLabel = landmark || LOCATION_LABELS[locationTier] || 'near your area';

  const handlePost = () => {
    onPost({
      photoUrl,
      caption,
      landmark: locationLabel,
      locationSharingOption: locationTier,
      approximateRegion: session?.approximateRegion ?? 'Wollongong area',
      preciseCoordinates: session?.preciseCoordinates,
      transportDetails: { plates, model: vehicle },
      isSafe: true,
    });
  };

  return (
    <div
      className="relative w-full flex-1 overflow-hidden rounded-[28px]"
      style={{ minHeight: 0 }}
    >
      <img src={photoUrl} alt="captured" className="absolute inset-0 w-full h-full object-cover" />

      {/* Gradient overlay */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2/3"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)' }}
      />

      {/* Retake button */}
      <div className="absolute top-4 left-4">
        <button
          onClick={onRetake}
          className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Location tag */}
      <div className="absolute top-4 right-4">
        <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <MapPin className="w-3 h-3 text-white" />
          <span className="text-white text-[10px]">{locationLabel}</span>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
        <input
          type="text"
          placeholder="what's going on? (optional)"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          className="w-full bg-white/15 backdrop-blur-sm text-white placeholder-white/60 text-sm px-4 py-2.5 rounded-2xl border border-white/20 outline-none"
          maxLength={100}
        />

        {/* Suggestion chips — only show when caption is empty */}
        {!caption && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CAPTION_SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => setCaption(s)}
                className="shrink-0 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-[11px] rounded-full border border-white/20"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Optional details toggle */}
        <button
          onClick={() => setShowDetails(v => !v)}
          className="text-white/70 text-[11px] underline underline-offset-2"
        >
          {showDetails ? 'Hide details' : '+ Add transport / landmark details'}
        </button>

        {showDetails && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Landmark (e.g. Crown Street)"
              value={landmark}
              onChange={e => setLandmark(e.target.value)}
              className="w-full bg-white/15 backdrop-blur-sm text-white placeholder-white/50 text-xs px-3 py-2 rounded-xl border border-white/20 outline-none"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Plate (e.g. ABC123)"
                value={plates}
                onChange={e => setPlates(e.target.value)}
                className="flex-1 bg-white/15 backdrop-blur-sm text-white placeholder-white/50 text-xs px-3 py-2 rounded-xl border border-white/20 outline-none"
              />
              <input
                type="text"
                placeholder="Vehicle (Honda Civic)"
                value={vehicle}
                onChange={e => setVehicle(e.target.value)}
                className="flex-1 bg-white/15 backdrop-blur-sm text-white placeholder-white/50 text-xs px-3 py-2 rounded-xl border border-white/20 outline-none"
              />
            </div>
          </div>
        )}

        <button
          onClick={handlePost}
          className="w-full py-3 bg-white text-forest font-bold text-sm rounded-2xl active:scale-[0.97] transition-transform shadow-lg"
        >
          Share with circle →
        </button>
      </div>
    </div>
  );
}
