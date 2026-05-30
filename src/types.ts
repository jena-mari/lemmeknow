/**
 * Types & Schema for LEMMEKNOW (LMK)
 */

export interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  avatarColor: string; // Tailwind class background
  initials: string;
  isCustom?: boolean;
}

export type LocationSharingOption = 'precise' | 'approximate' | 'landmark_only';

export interface SafetySession {
  isActive: boolean;
  reason: string; // Dynamic reason string to allow custom saved reasons
  intervalMinutes: number;
  startedAt: string; // ISO String
  checkInDueAt: string; // ISO String
  secondsRemaining: number;
  landmark: string;
  locationSharingOption: LocationSharingOption;
  preciseCoordinates?: string; // e.g. "-34.4250, 150.8931"
  approximateRegion?: string; // e.g. "Within 500m of Wollongong Central"
  initialNote: string;
  transportDetails: {
    plates: string;
    model: string;
  };
}

export interface CheckIn {
  id: string;
  timestamp: string; // ISO String or user-friendly string
  photoUrl: string;
  landmark: string;
  locationSharingOption?: LocationSharingOption;
  preciseCoordinates?: string;
  approximateRegion?: string;
  note: string;
  isEmergency?: boolean;
  transportDetails?: {
    plates: string;
    model: string;
  };
}

export type EscalationState = 
  | 'SAFE'             // Running fine
  | 'REMINDER_SENT'    // State 1: Due time passed, reminder sent to user
  | 'CIRCLE_NOTIFIED'   // State 2: 5 minutes elapsed, trusted circle notified of delayed update
  | 'ESCALATED';       // State 3: 15 minutes elapsed, full alert sent

export interface MockUpdate {
  id: string;
  friendName: string;
  friendInitials: string;
  friendColor: string;
  timeAgo: string;
  reason: string;
  landmark: string;
  note: string;
  photoUrl: string;
  transportText?: string;
  status: 'safe' | 'delayed' | 'need_help';
}
