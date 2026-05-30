import React, { useState } from 'react';
import { Camera, Navigation } from 'lucide-react';
import { CheckIn, Contact, SafetySession } from '../types';
import InstantsViewer from './InstantsViewer';

function formatCountdown(secs: number): string {
  if (secs <= 0) return 'overdue';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

interface Props {
  checkIns: CheckIn[];
  contacts: Contact[];
  session: SafetySession | null;
}

export default function InstantsGrid({ checkIns, contacts, session }: Props) {
  const [viewing, setViewing] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-2 space-y-4 relative">
      {/* Full-screen story viewer */}
      {viewing && (
        <InstantsViewer
          checkIns={checkIns}
          contacts={contacts}
          onClose={() => setViewing(false)}
        />
      )}

      {/* Active session location banner */}
      {session?.isActive && (
        <div className="bg-azure/60 rounded-3xl p-4 border border-azure flex items-center gap-3">
          <Navigation className="w-5 h-5 text-forest shrink-0" />
          <div>
            <p className="text-forest text-xs font-bold">Session active</p>
            <p className="text-forest/70 text-[11px]">
              {session.reason} · {session.approximateRegion}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-forest text-[11px] font-mono">
              {formatCountdown(session.secondsRemaining)}
            </p>
            <p className="text-forest/50 text-[10px]">next update</p>
          </div>
        </div>
      )}

      {/* Circle avatars */}
      <div>
        <p className="text-forest/50 text-[11px] font-medium mb-2 uppercase tracking-wider">
          Your circle
        </p>
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          {contacts.map(c => (
            <div key={c.id} className="flex flex-col items-center gap-1 shrink-0">
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                  checkIns.length > 0
                    ? 'border-forest bg-azure text-forest'
                    : 'border-forest/20 bg-cloud text-forest/50'
                }`}
              >
                {c.name[0]}
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
            Snap a photo and share it with your circle — they'll see it here.
          </p>
        </div>
      ) : (
        <div>
          <p className="text-forest/50 text-[11px] font-medium mb-2 uppercase tracking-wider">
            Recent updates
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
                  {ci.caption && (
                    <p className="text-white text-[10px] font-medium truncate">{ci.caption}</p>
                  )}
                  <p className="text-white/60 text-[9px]">{timeAgo(ci.timestamp)}</p>
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
