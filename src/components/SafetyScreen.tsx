import React, { useState } from 'react';
import { Shield, ShieldAlert, MapPin, AlertTriangle, Clock, Users, Phone, ChevronLeft } from 'lucide-react';
import { SafetySession, EscalationState } from '../types';
import StartSessionForm from './StartSessionForm';

function formatCountdown(secs: number): string {
  if (secs <= 0) return 'overdue';
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface Props {
  session: SafetySession | null;
  escalationState: EscalationState;
  onStartSession: (s: SafetySession) => void;
  onEndSession: () => void;
}

const RUNGS = [
  {
    label: 'Rung 1 · Soft nudge',
    desc: 'You get a push notification. Nothing is sent to your circle yet.',
  },
  {
    label: 'Rung 2 · Circle ping',
    desc: 'Circle gets a calm "hey, just a heads up" — not an alert.',
  },
  {
    label: 'Rung 3 · Location upgrade',
    desc: 'Circle view temporarily upgrades to Precise GPS. You are notified.',
  },
  {
    label: 'Rung 4 · 000 prompt',
    desc: 'You or your circle decide to call. This is NEVER automated.',
  },
];

export default function SafetyScreen({ session, escalationState, onStartSession, onEndSession }: Props) {
  const [showStartForm, setShowStartForm] = useState(false);

  // Escalation rung banner config
  const rungBanner = {
    SAFE: null,
    REMINDER_SENT: {
      bg: 'bg-yellow-orange/20 border-yellow-orange/50',
      icon: <Clock className="w-4 h-4 text-yellow-orange shrink-0" />,
      label: 'Reminder sent to you',
      sub: "We nudged you — your circle hasn't been notified yet.",
    },
    CIRCLE_NOTIFIED: {
      bg: 'bg-pink-accent/30 border-pink-accent/60',
      icon: <Users className="w-4 h-4 text-forest shrink-0" />,
      label: 'Circle gently notified',
      sub: 'Your circle received a calm heads-up with your last known location.',
    },
    ESCALATED: {
      bg: 'bg-red-50 border-red-200',
      icon: <Phone className="w-4 h-4 text-red-500 shrink-0" />,
      label: 'Would you like to call 000?',
      sub: 'Tap below only if you need emergency services. This is never automatic.',
    },
  }[escalationState];

  if (showStartForm) {
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-2 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <button onClick={() => setShowStartForm(false)}>
            <ChevronLeft className="w-5 h-5 text-forest/60" />
          </button>
          <p className="text-forest font-semibold text-sm">Set up a session</p>
        </div>
        <StartSessionForm
          onStartSession={s => { onStartSession(s); setShowStartForm(false); }}
          onLoadDemoPreset={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-2 space-y-3">

      {/* Escalation rung banner */}
      {rungBanner && (
        <div className={`rounded-3xl border p-4 flex gap-3 items-start ${rungBanner.bg}`}>
          {rungBanner.icon}
          <div>
            <p className="text-forest text-sm font-bold">{rungBanner.label}</p>
            <p className="text-forest/60 text-xs mt-0.5">{rungBanner.sub}</p>
            {escalationState === 'ESCALATED' && (
              <button
                onClick={() => alert('Calling 000… (simulated — this would launch the native dialler)')}
                className="mt-2 px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl"
              >
                Call 000 now
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active session card */}
      {session?.isActive ? (
        <div className="bg-forest rounded-3xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-cloud text-xs font-medium opacity-70">Active session</p>
              <p className="text-cloud text-base font-bold">{session.reason}</p>
            </div>
            <div className="text-right">
              <p className="text-yellow-orange font-mono text-xl font-bold">
                {formatCountdown(session.secondsRemaining)}
              </p>
              <p className="text-cloud/50 text-[10px]">next nudge</p>
            </div>
          </div>

          {/* Location tier */}
          <div className="bg-white/10 rounded-2xl p-3 space-y-1.5">
            <p className="text-cloud/70 text-[10px] uppercase tracking-wider">Location sharing</p>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-azure" />
              <p className="text-cloud text-xs">
                {session.locationSharingOption === 'precise'
                  ? 'Precise GPS shared with circle'
                  : session.locationSharingOption === 'approximate'
                  ? `Approximate · ${session.approximateRegion}`
                  : 'Manual updates only — no background tracking'}
              </p>
            </div>
          </div>

          {/* Transport / landmark notes */}
          {(session.transportDetails?.plates || session.landmark) && (
            <div className="bg-white/10 rounded-2xl p-3 space-y-1">
              <p className="text-cloud/70 text-[10px] uppercase tracking-wider">Trip notes</p>
              {session.landmark && (
                <p className="text-cloud text-xs">📍 {session.landmark}</p>
              )}
              {session.transportDetails?.plates && (
                <p className="text-cloud text-xs">
                  🚗 {session.transportDetails.plates} · {session.transportDetails.model}
                </p>
              )}
            </div>
          )}

          <button
            onClick={onEndSession}
            className="w-full py-2.5 border border-white/25 text-cloud/70 text-xs rounded-2xl"
          >
            End session
          </button>
        </div>
      ) : (
        /* No active session — start CTA + explainers */
        <div className="space-y-3">
          <div className="bg-cloud rounded-3xl p-4 border border-forest/10 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-forest" />
              <p className="text-forest font-bold text-sm">Safety session</p>
            </div>
            <p className="text-forest/60 text-xs leading-relaxed">
              Optionally set a check-in timer. Your circle gets a gentle nudge if you forget —
              not a full alert. Think of it like a BeReal timer, not a panic button.
            </p>
            <button
              onClick={() => setShowStartForm(true)}
              className="w-full py-2.5 bg-forest text-cloud text-sm font-semibold rounded-2xl"
            >
              Start a session
            </button>
          </div>

          {/* Location tiers */}
          <div className="bg-cloud rounded-3xl p-4 border border-forest/10 space-y-1">
            <p className="text-forest font-bold text-sm mb-2">Location settings</p>
            {([
              {
                tier: 'precise',
                desc: 'Exact GPS. Shared only during an active session — expires when you end it.',
                dot: 'bg-forest',
              },
              {
                tier: 'approximate',
                desc: '±500m fuzz applied. Shows your suburb or nearest landmark. Default.',
                dot: 'bg-yellow-orange',
              },
              {
                tier: 'manual',
                desc: 'Location only shared when you post a photo. No background tracking.',
                dot: 'bg-forest/30',
              },
            ] as const).map(({ tier, desc, dot }) => (
              <div
                key={tier}
                className="flex items-start gap-3 py-2 border-b border-forest/5 last:border-0"
              >
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${dot}`} />
                <div>
                  <p className="text-forest text-xs font-semibold capitalize">{tier}</p>
                  <p className="text-forest/50 text-[11px] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Concern mode rungs */}
          <div className="bg-cloud rounded-3xl p-4 border border-forest/10 space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-yellow-orange" />
              <p className="text-forest font-bold text-sm">How missed updates work</p>
            </div>
            {RUNGS.map((r, i) => (
              <div
                key={i}
                className="flex gap-3 items-start py-2 border-b border-forest/5 last:border-0"
              >
                <span className="text-[10px] font-mono bg-forest/10 text-forest px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-forest text-xs font-semibold">{r.label}</p>
                  <p className="text-forest/50 text-[11px] leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
