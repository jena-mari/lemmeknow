import React from 'react';
import { CheckIn, MockUpdate, SafetySession, EscalationState } from '../types';
import { MOCK_FRIENDS_UPDATES } from '../data/mockData';
import { MapPin, MessageCircle, Heart, Share2, Shield, Eye, Clock, Car, FlameKindling, Info, Sparkles, UserX, AlertTriangle } from 'lucide-react';

interface TrustedCircleFeedProps {
  userCheckIns: CheckIn[];
  friendsUpdates?: MockUpdate[];
  activeSession: SafetySession | null;
  escalationState: EscalationState;
  onOpenEmergencyCard: () => void;
  onSendNudge?: () => void;
}

export default function TrustedCircleFeed({
  userCheckIns,
  friendsUpdates = MOCK_FRIENDS_UPDATES,
  activeSession,
  escalationState,
  onOpenEmergencyCard,
  onSendNudge
}: TrustedCircleFeedProps) {

  // Helper formatting for dates/times
  const formatTimeAgo = (isoString: string) => {
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours}h ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="space-y-4" id="trusted-circle-feed">
      {/* Feed Filter title */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-serif text-lg font-bold text-forest">Circle Board</h3>
        <span className="text-[10px] text-forest/60 font-mono flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-forest/5">
          <Eye className="w-3 h-3 text-forest/40" />
          <span>Shared with your 3 trusted contacts</span>
        </span>
      </div>

      {/* MISSING CHECKIN ALERT PANEL INSIDE CIRCLE FEED (Visible if Overdue) */}
      {activeSession && escalationState !== 'SAFE' && (
        <div className="p-4 bg-pink-accent/25 border-2 border-pink-accent rounded-3xl space-y-3 text-left animate-fadeIn shadow-2sm" id="escalation-alert-box">
          <div className="flex items-start gap-2.5">
            <div className="p-1 rounded-lg bg-pink-accent text-forest mt-0.5 shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-700 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-red-950 uppercase tracking-wider">
                Overdue Safety Alert!
              </h4>
              <p className="text-[11px] text-[#2c0e13] leading-relaxed">
                {escalationState === 'REMINDER_SENT' && "You haven't posted your scheduled check-in. Reminder is sent to your screen, but not your circle yet."}
                {escalationState === 'CIRCLE_NOTIFIED' && "Your trusted circle has been alerted that you are 5m overdue! They see option to call your phone directly."}
                {escalationState === 'ESCALATED' && "CRITICAL: You are 15m+ overdue. Circle members can now access your emergency plate records and view your absolute location coordinates."}
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-1 font-sans">
            <button
              onClick={onOpenEmergencyCard}
              className="flex-1 py-2 bg-forest text-white hover:bg-forest/90 text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-2xs"
            >
              <Info className="w-3.5 h-3.5 text-yellow-orange fill-yellow-orange/10" />
              <span>View Emergency Card</span>
            </button>
            {onSendNudge && escalationState === 'CIRCLE_NOTIFIED' && (
              <button
                onClick={onSendNudge}
                className="py-2 px-3 bg-white hover:bg-cloud text-forest text-xs font-semibold rounded-xl border border-forest/15 cursor-pointer"
              >
                🔔 Nudge Back
              </button>
            )}
          </div>
        </div>
      )}

      {/* COMBINED FEEDS (Your feed in relation to your circle) */}
      <div className="space-y-4">
        {/* User's Current Session Posts in Timeline */}
        {activeSession && userCheckIns.length === 0 && (
          <div className="p-5 bg-white rounded-3xl border border-forest/10 text-center space-y-2 py-6">
            <FlameKindling className="w-8 h-8 text-yellow-orange/70 mx-auto" />
            <h4 className="font-semibold text-xs text-forest uppercase tracking-wide">Pending BeReal photo context</h4>
            <p className="text-[11px] text-forest/60 max-w-xs mx-auto">
              You started a safe session for <strong>{activeSession.reason}</strong>. Drop a photographic update right away to lock in your initial departure reference!
            </p>
          </div>
        )}

        {/* User Check-ins List */}
        {userCheckIns.map((ci, index) => (
          <div
            key={ci.id}
            id={`my-checkin-${ci.id}`}
            className="bg-white rounded-3xl overflow-hidden border border-forest/10 shadow-sm text-left transition-all"
          >
            {/* Header / Author */}
            <div className="p-3.5 flex items-center justify-between border-b border-forest/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-forest text-white font-serif font-bold text-xs flex items-center justify-center">
                  ME
                </div>
                <div>
                  <div className="font-bold text-xs text-forest flex items-center gap-1.5 leading-none">
                    <span>You (Late Travel Home)</span>
                    <span className="bg-azure text-forest/80 text-[8px] font-bold px-1.5 py-0.2 rounded">
                      SAFE STATUS
                    </span>
                  </div>
                  <span className="text-[10px] text-forest/50 font-mono">
                    {formatTimeAgo(ci.timestamp)}
                  </span>
                </div>
              </div>

              {/* Extra context log label */}
              {ci.transportDetails?.plates && (
                <span className="text-[8px] font-mono text-forest/70 bg-[#eedebf] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Uber Logged
                </span>
              )}
            </div>

            {/* Photo Post */}
            <div className="relative aspect-[4/3] bg-forest/5">
              <img
                src={ci.photoUrl}
                alt="My checkin"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-yellow-orange" />
                  <span>{ci.landmark}</span>
                </div>
              </div>
            </div>

            {/* Footer comments and notes */}
            <div className="p-3.5 space-y-2">
              <p className="text-xs text-forest/80 italic font-medium leading-relaxed">
                "{ci.note}"
              </p>

              {ci.transportDetails?.plates && (
                <div className="p-2 bg-cloud rounded-2xl flex items-center justify-between text-[11px] text-forest/70 border border-forest/5 font-mono">
                  <span>🚗 Uber: {ci.transportDetails.model}</span>
                  <span className="font-bold text-forest uppercase">{ci.transportDetails.plates}</span>
                </div>
              )}

              {/* Interaction Row representing mock feedback from family */}
              <div className="pt-2 border-t border-forest/5 flex items-center justify-between text-xs text-forest/50 font-medium">
                <div className="flex gap-4">
                  <button type="button" className="flex items-center gap-1 hover:text-forest transition-colors">
                    <Heart className="w-4 h-4 text-pink-accent fill-pink-accent" />
                    <span>3 looked out</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>Sarah: "Keep safe!"</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenEmergencyCard}
                  className="text-forest hover:underline text-[10px] font-bold uppercase tracking-wider flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Info Card</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Friend Posts */}
        {friendsUpdates.map((friend) => (
          <div
            key={friend.id}
            id={`friend-card-${friend.id}`}
            className="bg-white rounded-3xl overflow-hidden border border-forest/10 shadow-sm text-left transition-all"
          >
            {/* Header / Author */}
            <div className="p-3.5 flex items-center justify-between border-b border-forest/5">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-full ${friend.friendColor} flex items-center justify-center text-xs font-bold`}>
                  {friend.friendInitials}
                </div>
                <div>
                  <div className="font-bold text-xs text-forest flex items-center gap-1.5 leading-none">
                    <span>{friend.friendName}</span>
                    <span className="bg-[#e4eed7] text-forest text-[8px] font-bold px-1.5 py-0.2 rounded">
                      {friend.reason}
                    </span>
                  </div>
                  <span className="text-[10px] text-forest/50 font-mono">
                    {friend.timeAgo}
                  </span>
                </div>
              </div>
            </div>

            {/* Photo Post */}
            <div className="relative aspect-[4/3] bg-forest/5">
              <img
                src={friend.photoUrl}
                alt={friend.friendName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-white">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-yellow-orange" />
                  <span>{friend.landmark}</span>
                </div>
              </div>
            </div>

            {/* Footer comments and notes */}
            <div className="p-3.5 space-y-2">
              <p className="text-xs text-forest/80 italic font-medium leading-relaxed">
                "{friend.note}"
              </p>

              {friend.transportText && (
                <div className="p-2 bg-cloud rounded-2xl flex items-center text-[10px] text-forest/70 border border-forest/5 font-mono">
                  <span>🚞 {friend.transportText}</span>
                </div>
              )}

              {/* Interaction Row */}
              <div className="pt-2 border-t border-forest/5 flex items-center justify-between text-xs text-forest/50 font-medium">
                <div className="flex gap-4">
                  <button type="button" className="flex items-center gap-1 hover:text-red-500 transition-colors">
                    <Heart className="w-4 h-4 hover:fill-red-500" />
                    <span>Lobby Safe Nudge</span>
                  </button>
                </div>
                <span className="text-[10px] bg-azure/40 text-forest px-2 py-0.5 rounded-md font-medium">
                  Verified check-in
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
