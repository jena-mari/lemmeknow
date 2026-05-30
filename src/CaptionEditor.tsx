import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, MapPin, Wand2, X } from 'lucide-react';
import { CheckIn, LocationSharingOption } from './types';

const CAPTION_SUGGESTIONS = [
  'at hackathon rn lol',
  'heading home now',
  'quick check-in',
  'grabbing dinner',
  'made it here',
];

interface CaptionEditorProps {
  photoUrl: string;
  initialLandmark?: string;
  locationSharingOption?: LocationSharingOption;
  approximateRegion?: string;
  preciseCoordinates?: string;
  onPost: (data: Omit<CheckIn, 'id' | 'timestamp'>) => void;
  onRetake: () => void;
}

export default function CaptionEditor({
  photoUrl,
  initialLandmark = '',
  locationSharingOption = 'approximate',
  approximateRegion,
  preciseCoordinates,
  onPost,
  onRetake,
}: CaptionEditorProps) {
  const [note, setNote] = useState('');
  const [landmark, setLandmark] = useState(initialLandmark);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [transport, setTransport] = useState('');

  const handlePost = () => {
    onPost({
      photoUrl,
      landmark: landmark.trim() || approximateRegion || 'place tag',
      note: note.trim() || 'quick little update',
      locationSharingOption,
      approximateRegion: locationSharingOption === 'approximate' ? approximateRegion : undefined,
      preciseCoordinates: locationSharingOption === 'precise' ? preciseCoordinates : undefined,
      transportDetails: transport.trim()
        ? {
            plates: transport.trim(),
            model: 'transit note',
          }
        : undefined,
    });
  };

  return (
    <div className="lmk-page -mx-4 -my-4 min-h-full px-4 py-5 text-left text-brand-black">
      <div className="lmk-shell">
        <section className="lmk-story-card relative z-10 overflow-hidden rounded-[34px] bg-brand-black shadow-[0_18px_42px_rgba(18,66,36,0.14)]">
          <div className="relative aspect-[4/5]">
            <img src={photoUrl} alt="Captured update" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

            <button
              type="button"
              onClick={onRetake}
              className="lmk-tap absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur"
              aria-label="Retake photo"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-black">
                <MapPin className="h-3.5 w-3.5 text-yellow-orange" />
                <span>{landmark || approximateRegion || 'place tag'}</span>
              </div>
              <p className="text-xl font-black">{note || 'Add a tiny update'}</p>
            </div>
          </div>
        </section>

        <section className="lmk-panel relative z-10 mt-4 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-black text-brand-black">Caption</h2>
            <span className="flex items-center gap-1 rounded-full bg-[#cce6fc] px-3 py-1.5 text-[10px] font-black text-brand-black">
              <Wand2 className="h-3.5 w-3.5 text-forest" />
              Gemini
            </span>
          </div>

          <textarea
            placeholder="at hackathon rn lol"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="h-16 w-full resize-none rounded-[24px] border border-white/80 bg-white/82 p-3 text-sm font-bold text-brand-black placeholder:text-brand-black/60 shadow-inner focus:outline-none"
          />

          {!note && (
            <div className="mt-2 flex gap-1.5 overflow-x-auto no-scrollbar">
              {CAPTION_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setNote(suggestion)}
                  className="lmk-tap shrink-0 rounded-full border border-white/80 bg-white/82 px-3 py-1.5 text-[10px] font-bold text-brand-black/70"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-black/65" />
              <input
                value={landmark}
                onChange={(event) => setLandmark(event.target.value)}
                placeholder="location tag"
                className="w-full rounded-full border border-white/80 bg-white/82 py-3 pl-9 pr-3 text-xs font-bold text-brand-black placeholder:text-brand-black/60 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setDetailsOpen((open) => !open)}
              className="lmk-tap flex items-center gap-1 rounded-full bg-light-green/80 px-3 py-2 text-[10px] font-black text-forest"
            >
              more
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {detailsOpen && (
            <div className="lmk-drawer mt-3 rounded-[24px] bg-[#cce6fc]/45 p-3">
              <input
                value={transport}
                onChange={(event) => setTransport(event.target.value)}
                placeholder="ride / transit detail"
                className="w-full rounded-[18px] border border-white/80 bg-white px-3 py-3 text-xs font-bold text-brand-black placeholder:text-brand-black/60 focus:outline-none"
              />
            </div>
          )}
        </section>

        <button
          type="button"
          onClick={handlePost}
          className="lmk-primary relative z-10 mt-4 flex h-[62px] w-full items-center justify-center gap-1.5 bg-yellow-orange px-4 text-[18px] font-medium text-black"
        >
          <CheckCircle2 className="h-4 w-4 text-black" />
          Post to circle
        </button>
      </div>
    </div>
  );
}
