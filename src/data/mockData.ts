import { Contact, MockUpdate } from '../types';

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Sarah Chen',
    relationship: 'Roommate',
    phone: '+61 412 345 678',
    avatarColor: 'bg-azure text-forest font-bold',
    initials: 'SC'
  },
  {
    id: 'c2',
    name: 'Marcus Miller',
    relationship: 'Brother',
    phone: '+61 498 765 432',
    avatarColor: 'bg-pink-accent text-forest font-bold',
    initials: 'MM'
  },
  {
    id: 'c3',
    name: 'Elena Rostova',
    relationship: 'Best Friend',
    phone: '+61 455 111 222',
    avatarColor: 'bg-[#f0debe] text-forest font-bold',
    initials: 'ER'
  }
];

export const MOCK_FRIENDS_UPDATES: MockUpdate[] = [
  {
    id: 'u1',
    friendName: 'Elena Rostova',
    friendInitials: 'ER',
    friendColor: 'bg-[#f0debe] text-forest font-bold',
    timeAgo: '45m ago',
    reason: 'Night Out',
    landmark: 'The Ritz Cocktail Bar',
    note: 'Walking with Sarah now. Staying in a group. Next check-in is set for midnight!',
    photoUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=400&q=80',
    status: 'safe'
  },
  {
    id: 'u2',
    friendName: 'Marcus Miller',
    friendInitials: 'MM',
    friendColor: 'bg-pink-accent text-forest font-bold',
    timeAgo: '2h ago',
    reason: 'Travelling',
    landmark: 'Sydney Trains (Platform 3)',
    note: 'Boarded the South Coast line train. Reading a book, phone is on 82%. See you guys soon!',
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80',
    transportText: 'Train Line T4, Carriage 2390',
    status: 'safe'
  }
];

export const CALMING_MOCK_PHOTOS = [
  {
    name: 'Uber Passenger Seat',
    url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=500&q=80',
    tag: 'Rideshare'
  },
  {
    name: 'Wollongong Station Platform',
    url: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=500&q=80',
    tag: 'Travelling'
  },
  {
    name: 'Cozy Crown Street Cafe',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=500&q=80',
    tag: 'Night Out / Dinner'
  },
  {
    name: 'Quiet Evening Sidewalk',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80',
    tag: 'Walking'
  }
];
