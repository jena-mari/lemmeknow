import React from 'react';
import { CalendarDays, MapPin, ShieldCheck } from 'lucide-react';
import { CheckIn } from '../types';

interface SafetyScreenProps {
  updates: CheckIn[];
  onOpenUpdates: () => void;
}

export default function SafetyScreen({ updates, onOpenUpdates }: SafetyScreenProps) {
  const latest = updates[0];

  return (
    <section className="lmk-panel relative z-10 p-4 text-left">
      <div className="mb-3 flex items-center justify-center gap-2 text-center">
        <ShieldCheck className="h-4 w-4 text-forest" />
        <h3 className="text-sm font-black text-brand-black">Review access</h3>
      </div>

      {latest ? (
        <div className="rounded-[26px] bg-white/68 p-3 text-center shadow-inner">
          <p className="text-sm font-black text-brand-black">Latest private update</p>
          <p className="mx-auto mt-1 max-w-[280px] text-xs font-bold text-brand-black/72">
            {formatDateTime(latest.timestamp)} · {latest.note}
          </p>
          <p className="mt-2 flex items-center justify-center gap-1 text-[10px] font-black text-forest/70">
            <MapPin className="h-3.5 w-3.5" />
            Last known: {latest.hideLocation ? 'location hidden' : latest.attachedLocation?.label || latest.landmark || 'not tagged'}
          </p>
          {latest.extractedContext?.activity && (
            <p className="mt-1 text-[10px] font-black text-brand-black/58">
              {latest.extractedContext.activity}
              {latest.extractedContext.vehiclePlate ? ` · plate ${latest.extractedContext.vehiclePlate}` : ''}
            </p>
          )}
          {latest.attachedLocation && !latest.hideLocation && (
            <a
              href={latest.attachedLocation.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex rounded-full bg-light-green/80 px-4 py-2 text-[10px] font-black text-forest"
            >
              Open in Google Maps
            </a>
          )}
        </div>
      ) : (
        <div className="rounded-[26px] bg-white/68 p-3 text-center shadow-inner">
          <p className="text-sm font-black text-brand-black">No private updates yet</p>
          <p className="mx-auto mt-1 max-w-[260px] text-xs font-bold text-brand-black/72">
            Once you post, your circle can review notes, timestamps, and location tags here.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onOpenUpdates}
        className="lmk-tap mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-light-green/80 px-4 py-3 text-xs font-black text-forest"
      >
        <CalendarDays className="h-4 w-4" />
        Open Updates and Recap
      </button>
    </section>
  );
}

function formatDateTime(isoString: string) {
  try {
    return new Date(isoString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return 'recently';
  }
}
