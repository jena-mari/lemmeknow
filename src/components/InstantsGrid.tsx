import React, { useState } from 'react';
import { Camera, Images } from 'lucide-react';
import { CheckIn, Contact } from '../types';
import InstantsViewer from './InstantsViewer';

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

interface Props {
  checkIns: CheckIn[];
  contacts: Contact[];
  title?: string;
}

export default function InstantsGrid({ checkIns, contacts, title = 'Review grid' }: Props) {
  const [viewing, setViewing] = useState(false);

  return (
    <div className="relative space-y-4">
      {/* Full-screen story viewer */}
      {viewing && (
        <InstantsViewer
          checkIns={checkIns}
          contacts={contacts}
          onClose={() => setViewing(false)}
        />
      )}

      {/* Circle avatars */}
      <div>
        <p className="mb-2 flex items-center justify-center gap-2 text-sm font-black text-brand-black">
          <Images className="h-4 w-4 text-forest" />
          {title}
        </p>
        <div className="flex justify-center gap-3 overflow-x-auto pb-1 no-scrollbar">
          {contacts.map(c => (
            <div key={c.id} className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                  checkIns.length > 0
                    ? 'border-forest bg-azure text-forest'
                    : 'border-forest/20 bg-white/72 text-forest/50'
                }`}
              >
                {c.initials || c.name[0]}
              </div>
              <span className="text-[10px] text-forest/60 max-w-[56px] truncate text-center">
                {c.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Photo grid or empty state */}
      {checkIns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-azure/40 flex items-center justify-center">
            <Camera className="w-7 h-7 text-forest/40" />
          </div>
          <p className="text-forest/50 text-sm">No updates yet</p>
          <p className="text-forest/35 text-xs max-w-[200px]">
            Snap a photo and your circle can review it here.
          </p>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-center text-[11px] font-bold text-brand-black/68">
            Tap a photo to review notes, time, and location.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {checkIns.map((ci, i) => (
              <button
                key={ci.id}
                onClick={() => setViewing(true)}
                className="relative aspect-square rounded-2xl overflow-hidden bg-cloud active:scale-[0.97] transition-transform"
              >
                <img src={ci.photoUrl} alt="update" className="w-full h-full object-cover" />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }}
                />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-[10px] font-medium truncate">{ci.note}</p>
                  <p className="truncate text-white/60 text-[9px]">
                    {timeAgo(ci.timestamp)} · {ci.hideLocation ? 'location hidden' : ci.attachedLocation?.placeName || ci.attachedLocation?.label || ci.landmark}
                  </p>
                </div>
                {/* New update dot on the most recent */}
                {i === 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-yellow-orange" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
