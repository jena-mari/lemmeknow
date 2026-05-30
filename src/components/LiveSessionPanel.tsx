import React, { useEffect, useState } from 'react';
import { SafetySession, EscalationState } from '../types';
import { 
  Clock, Shield, Car, CheckCircle2, AlertOctagon, HelpCircle, 
  MapPin, Bell, ChevronRight, UserCheck, ShieldClose, AlertTriangle, Eye, FastForward
} from 'lucide-react';

interface LiveSessionPanelProps {
  session: SafetySession;
  escalationState: EscalationState;
  onPostNewCheckInTrigger: () => void;
  onEndSession: () => void;
  onTriggerEmergency: () => void;
  onAdvanceTime: (minutes: number) => void;
}

export default function LiveSessionPanel({
  session,
  escalationState,
  onPostNewCheckInTrigger,
  onEndSession,
  onTriggerEmergency,
  onAdvanceTime
}: LiveSessionPanelProps) {
  const [percentLeft, setPercentLeft] = useState(100);

  useEffect(() => {
    const totalSecs = session.intervalMinutes * 60;
    const currentPercent = Math.max(0, Math.min(100, (session.secondsRemaining / totalSecs) * 100));
    setPercentLeft(currentPercent);
  }, [session.secondsRemaining, session.intervalMinutes]);

  const formatTime = (secs: number) => {
    const isNegative = secs < 0;
    const absSecs = Math.abs(secs);
    const m = Math.floor(absSecs / 60);
    const s = absSecs % 60;
    return `${isNegative ? '-' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Helper colors for timers
  const getStatusColors = () => {
    switch (escalationState) {
      case 'SAFE':
        return {
          bg: 'bg-[#e2f1fe]',
          progress: 'bg-forest',
          text: 'text-forest',
          label: 'On Schedule'
        };
      case 'REMINDER_SENT':
        return {
          bg: 'bg-yellow-orange/10',
          progress: 'bg-yellow-orange',
          text: 'text-yellow-orange-dark',
          label: 'State 1: Time Passed'
        };
      case 'CIRCLE_NOTIFIED':
        return {
          bg: 'bg-pink-accent/15',
          progress: 'bg-pink-accent',
          text: 'text-red-700',
          label: 'State 2: Friends Warning'
        };
      case 'ESCALATED':
        return {
          bg: 'bg-red-50',
          progress: 'bg-red-600',
          text: 'text-red-800',
          label: 'State 3: Fully Alerted'
        };
    }
  };

  const statusStyle = getStatusColors();

  // Handle human-friendly timer message
  const getTimerSubMessage = () => {
    if (session.secondsRemaining > 0) {
      return `Next check-in due in ${Math.ceil(session.secondsRemaining / 60)} mins`;
    } else {
      const overdueMins = Math.floor(Math.abs(session.secondsRemaining) / 60);
      return `Delayed by ${overdueMins} mins`;
    }
  };

  return (
    <div className="space-y-4 px-1" id="live-session-panel">
      {/* Active Session Status Bar */}
      <div className={`p-4 rounded-3xl ${statusStyle.bg} border border-forest/5 flex flex-col items-center justify-center text-center space-y-3 shadow-2sm relative overflow-hidden transition-colors duration-500`}>
        {/* Glow backdrop decor */}
        <div className="absolute -right-12 -top-12 w-28 h-28 bg-[#ffffff40] rounded-full blur-xl" />

        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/85 backdrop-blur-sm rounded-full text-[10px] font-bold text-forest uppercase tracking-wider relative z-10 shadow-2xs">
          <span className="w-1.5 h-1.5 bg-yellow-orange rounded-full animate-ping" />
          <span>Active Session • {session.reason}</span>
        </div>

        {/* Dynamic Timer Circular or Large text */}
        <div className="space-y-1 relative z-10">
          <div className="font-serif text-4xl font-extrabold tracking-tight text-forest select-all">
            {formatTime(session.secondsRemaining)}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-forest/70">
            {getTimerSubMessage()}
          </div>
        </div>

        {/* Custom Progress line */}
        <div className="w-full h-2 bg-white/65 rounded-full overflow-hidden relative z-10 mt-1 border border-forest/10">
          <div
            className={`h-full ${statusStyle.progress} transition-all duration-1000 rounded-full`}
            style={{ width: `${percentLeft}%` }}
          />
        </div>

        {/* Action button inside timer card */}
        <button
          onClick={onPostNewCheckInTrigger}
          className="w-full py-2.5 bg-forest hover:bg-forest/90 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-sm relative z-10 cursor-pointer pt-3 pb-3 shrink-0"
          id="btn-fast-checkin"
        >
          <CheckCircle2 className="w-4 h-4 text-yellow-orange fill-yellow-orange/10 animate-bounce" />
          <span>Check-in Safe Now (BeReal Photo)</span>
        </button>
      </div>

      {/* Safety Session Info Details */}
      <div className="p-3.5 bg-white rounded-3xl border border-forest/10 space-y-3 shadow-2sm text-left">
        <div className="font-bold text-[9px] text-forest/50 uppercase tracking-widest pb-1 border-b border-forest/5">
          Transit Parameters
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-0.5">
            <span className="text-forest/50 text-[10px]">Landmark Departure</span>
            <div className="font-semibold text-forest flex items-center gap-1 truncate text-[11px]" title={session.landmark}>
              <MapPin className="w-3.5 h-3.5 text-forest/40 shrink-0" />
              <span className="truncate">{session.landmark}</span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-forest/50 text-[10px]">Trusted Circle Interval</span>
            <div className="font-semibold text-forest flex items-center gap-1 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-forest/40 shrink-0" />
              <span>Every {session.intervalMinutes} minutes</span>
            </div>
          </div>
        </div>

        {/* Location Security Mode Indicator */}
        <div className="pt-2 border-t border-forest/5 space-y-1">
          <span className="text-forest/50 text-[10px] block">Anti-Surveillance Privacy Preference</span>
          <div className="p-2 bg-azure/40 rounded-xl flex items-center justify-between text-xs font-mono text-forest border border-forest/5">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-forest/80 shrink-0" />
              <span className="font-bold uppercase tracking-tight">
                {session.locationSharingOption === 'precise' && "Precise GPS"}
                {session.locationSharingOption === 'approximate' && "Approximate Circle"}
                {session.locationSharingOption === 'landmark_only' && "Text Landmark Only"}
              </span>
            </div>
            <span className="text-[9px] bg-white text-forest/70 font-semibold px-2 py-0.2 rounded-full border border-forest/5">
              {session.locationSharingOption === 'precise' && "Target Active"}
              {session.locationSharingOption === 'approximate' && "~400m radius obfuscated"}
              {session.locationSharingOption === 'landmark_only' && "No GPS emitted"}
            </span>
          </div>
        </div>

        {session.transportDetails.plates && (
          <div className="pt-2 border-t border-forest/5 space-y-1">
            <span className="text-forest/50 text-[10px] block">Rideshare Marker Logged</span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-yellow-orange text-forest text-[10px] font-mono font-bold rounded">
                {session.transportDetails.plates}
              </span>
              <span className="text-xs font-semibold text-forest">
                {session.transportDetails.model}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* TIMED UPDATE ESCALATION PATH - 3 State Timeline */}
      <div className="p-4 bg-white rounded-3xl border border-forest/10 space-y-3 shadow-2sm text-left">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-xs text-forest/80 uppercase tracking-wider">
            Private Check-in Escalation Flow
          </h4>
          <span className="text-[9px] bg-azure font-mono text-forest px-1.5 py-0.5 rounded-full">
            Anti-Panic Policy
          </span>
        </div>

        {/* Timeline representation */}
        <div className="space-y-3.5 relative pl-4 border-l border-forest/10 ml-1">
          {/* State 1: Reminder */}
          <div className="relative">
            <div className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 border-white ${
              session.secondsRemaining <= 0 ? 'bg-yellow-orange' : 'bg-neutral-200'
            }`} />
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-forest flex items-center gap-1.5 leading-none">
                <span>State 1: Time Passed</span>
                {session.secondsRemaining <= 0 && (
                  <span className="bg-yellow-orange/20 text-forest text-[8px] font-bold px-1.5 py-0.2 rounded font-mono">
                    ACTIVE REMINDER
                  </span>
                )}
              </div>
              <span className="text-[10px] text-forest/65 block">
                Discrete haptic and popup reminder sent to your device. No alert is sent to anyone else.
              </span>
            </div>
          </div>

          {/* State 2: Notify circle */}
          <div className="relative">
            <div className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 border-white ${
              session.secondsRemaining <= -300 ? 'bg-pink-accent' : 'bg-neutral-200'
            }`} />
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-forest flex items-center gap-1.5 leading-none">
                <span>State 2: Circle Notified (+5 Min)</span>
                {session.secondsRemaining <= -300 && (
                  <span className="bg-pink-accent text-forest text-[8px] font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                    Friends Warned
                  </span>
                )}
              </div>
              <span className="text-[10px] text-forest/65 block">
                A custom nudge is placed on friends' feed stating your update is overdue. Simple "nudge back" options exist to prompt you.
              </span>
            </div>
          </div>

          {/* State 3: Escalate */}
          <div className="relative">
            <div className={`absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 border-white ${
              session.secondsRemaining <= -900 ? 'bg-red-500' : 'bg-neutral-200'
            }`} />
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-forest flex items-center gap-1.5 leading-none">
                <span>State 3: Fully Overdue (+15 Min)</span>
                {session.secondsRemaining <= -900 && (
                  <span className="bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                    ALERT ACTIVE
                  </span>
                )}
              </div>
              <span className="text-[10px] text-forest/65 block">
                Circle contacts are given direct access to export your Emergency Info Card containing latest photo and Uber details to present to first responders.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK TESTING CONTROL PANEL */}
      <div className="p-3 bg-[#e6ddca]/30 rounded-3xl border border-forest/15 space-y-2 text-left">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-forest/70">
          <FastForward className="w-4 h-4 text-forest" />
          <span>Demo Accelerator Tools</span>
        </div>
        <p className="text-[10px] text-forest/65 leading-relaxed">
          Quickly advance time to witness exactly how LMK handles the 3 missed check-in stages without sitting around!
        </p>
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => onAdvanceTime(10)}
            className="py-1.5 px-2 bg-white hover:bg-[#b5d6f550] text-[#1e4266] text-[11px] font-semibold rounded-xl border border-azure cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
          >
            <span>+10 Mins</span>
          </button>
          <button
            onClick={() => onAdvanceTime(25)}
            className="py-1.5 px-2 bg-white hover:bg-yellow-orange/15 text-forest text-[11px] font-semibold rounded-xl border border-yellow-orange cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
          >
            <span>+25 Mins</span>
          </button>
          <button
            onClick={() => onAdvanceTime(35)}
            className="py-1.5 px-2 bg-[#fbe7e7] hover:bg-[#fbdad9] text-red-800 text-[11px] font-semibold rounded-xl border border-pink-accent cursor-pointer flex items-center justify-center gap-1 shadow-2xs"
          >
            <span>+35 Mins</span>
          </button>
        </div>
      </div>

      {/* Safety Core Actions: Safe Exit & Help */}
      <div className="flex gap-2 pt-1 font-sans">
        <button
          onClick={onTriggerEmergency}
          className="flex-1 py-3 bg-pink-accent hover:bg-[#ebabb7] text-forest font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border border-[#ebabb7]/40 shrink-0"
          id="btn-help-emergency"
        >
          <AlertOctagon className="w-4 h-4 text-red-700 animate-pulse" />
          <span>I Need Help!</span>
        </button>

        <button
          onClick={onEndSession}
          className="flex-1.3 py-3 bg-[#124224] hover:bg-[#0c2e19] text-[#f7f2e8] font-semibold text-xs rounded-2xl flex items-center justify-center gap-1 shadow-sm cursor-pointer shrink-0"
          id="btn-wrap-session-safe"
        >
          <UserCheck className="w-4 h-4 text-yellow-orange" />
          <span>I'm Safe, End Ride</span>
        </button>
      </div>
    </div>
  );
}
