/**
 * Types & Schema for LMK
 */

export interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  avatarColor: string; // Tailwind class background
  initials: string;
  source?: 'contacts' | 'instagram' | 'messenger' | 'manual';
  isCustom?: boolean;
}

export type LocationSharingOption = 'precise' | 'approximate' | 'landmark_only';

export interface CheckIn {
  id: string;
  timestamp: string; // ISO String or user-friendly string
  photoUrl: string;
  landmark: string;
  locationSharingOption?: LocationSharingOption;
  preciseCoordinates?: string;
  approximateRegion?: string;
  note: string;
  transportDetails?: {
    plates: string;
    model: string;
  };
}

export interface MockUpdate {
  id: string;
  friendName: string;
  friendInitials: string;
  friendColor: string;
  timestamp?: string;
  timeAgo: string;
  reason: string;
  landmark: string;
  note: string;
  photoUrl: string;
  transportText?: string;
  status: 'fresh' | 'seen' | 'quiet';
}
