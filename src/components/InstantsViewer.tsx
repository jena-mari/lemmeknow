import React, { useState } from 'react';
import { MapPin, X, CheckCircle } from 'lucide-react';
import { CheckIn, Contact } from '../types';

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

interface Props {
  checkIns: CheckIn[];
  contacts: Contact[];
  onClose: () => void;
}

export default function InstantsViewer({ checkIns, contacts, onClose }: Props) {
  const [idx, setIdx] = useState(0);
  const total = checkIns.length;

  if (total === 0) return null;

  const current = checkIns[idx];
  const contact = contacts[idx % contacts.length];

  return (
    <div className="absolute inset-0 z-50 bg-black flex flex-col">
      {/* Progress bars */}
      <div className="flex gap-1 px-4 pt-3 pb-2">
        {checkIns.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full overflow-hidden bg-white/30">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: i < idx ? '100%' : i === idx ? '50%' : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Header: avatar + name + close */}
      <div className="flex items-center gap-2 px-4 pb-2">
        <div className="w-8 h-8 rounded-full bg-azure flex items-center justify-center text-forest font-bold text-xs">
          {contact?.name?.[0] ?? 'Y'}
        </div>
        <div>
          <p className="text-white text-xs font-semibold">{contact?.name ?? 'You'}</p>
          <p className="text-white/60 text-[10px]">{timeAgo(current.timestamp)}</p>
        </div>
        <button onClick={onClose} className="ml-auto">
          <X className="w-5 h-5 text-white/70" />
        </button>
      </div>

      {/* Photo */}
      <div className="flex-1 relative mx-3 rounded-[24px] overflow-hidden">
        <img
          src={current.photoUrl}
          alt="check-in"
          className="w-full h-full object-cover"
        />

        {/* Location pin */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <MapPin className="w-3 h-3 text-white" />
          <span className="text-white text-[10px]">{current.landmark}</span>
        </div>

        {/* Transport badge */}
        {current.transportDetails?.plates && (
          <div className="absolute top-3 right-3 bg-yellow-orange/90 px-2 py-1 rounded-full">
            <span className="text-forest text-[10px] font-bold">
              🚗 {current.transportDetails.plates}
            </span>
          </div>
        )}

        {/* Caption */}
        {current.caption && (
          <div
            className="absolute bottom-0 left-0 right-0 p-4"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)' }}
          >
            <p className="text-white text-sm font-medium">{current.caption}</p>
          </div>
        )}

        {/* Tap zones: left = previous, right = next */}
        <button
          className="absolute left-0 top-0 bottom-0 w-1/3"
          onClick={() => setIdx(i => Math.max(0, i - 1))}
          aria-label="Previous"
        />
        <button
          className="absolute right-0 top-0 bottom-0 w-1/3"
          onClick={() => setIdx(i => Math.min(total - 1, i + 1))}
          aria-label="Next"
        />
      </div>

      {/* Safe status footer */}
      <div className="flex items-center justify-center gap-2 py-4">
        <CheckCircle className="w-4 h-4 text-green-400" />
        <span className="text-white/80 text-xs">Safe · {current.approximateRegion}</span>
      </div>
    </div>
  );
}
