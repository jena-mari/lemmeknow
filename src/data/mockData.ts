import { AttachedLocation, Contact, MockUpdate } from '../types';

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number, hour = 18, minute = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const mapLocation = (label: string, latitude: number, longitude: number, capturedAt: string): AttachedLocation => ({
  latitude,
  longitude,
  accuracy: 28,
  label,
  capturedAt,
  googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitude},${longitude}`)}`,
});

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
    timestamp: minutesAgo(45),
    timeAgo: '45m ago',
    reason: 'Night Out',
    landmark: 'The Ritz Cocktail Bar',
    attachedLocation: mapLocation('near The Ritz, Crown St', -34.42591, 150.89372, minutesAgo(45)),
    note: 'walking with Sarah now, tiny night-out update',
    extractedContext: {
      activity: 'Walking',
      destination: 'taxi rank',
      people: ['Sarah'],
      transitMode: 'walk',
      cleanedNote: 'walking with Sarah now, tiny night-out update',
    },
    photoUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=400&q=80',
    status: 'fresh'
  },
  {
    id: 'u2',
    friendName: 'Marcus Miller',
    friendInitials: 'MM',
    friendColor: 'bg-pink-accent text-forest font-bold',
    timestamp: hoursAgo(2),
    timeAgo: '2h ago',
    reason: 'Travelling',
    landmark: 'Sydney Trains (Platform 3)',
    attachedLocation: mapLocation('Sydney Trains Platform 3', -33.88221, 151.20672, hoursAgo(2)),
    note: 'Boarded the South Coast line train. Reading a book, phone is on 82%. See you guys soon!',
    extractedContext: {
      activity: 'Train ride',
      destination: 'home',
      transitMode: 'train',
      cleanedNote: 'Boarded the South Coast line train.',
    },
    photoUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80',
    transportText: 'Train Line T4, Carriage 2390',
    status: 'seen'
  },
  {
    id: 'u3',
    friendName: 'Elena Rostova',
    friendInitials: 'ER',
    friendColor: 'bg-[#f0debe] text-forest font-bold',
    timestamp: daysAgo(1, 21, 10),
    timeAgo: 'Yesterday',
    reason: 'Dinner',
    landmark: 'Darling Square',
    attachedLocation: mapLocation('Darling Square', -33.87742, 151.20249, daysAgo(1, 21, 10)),
    note: 'late dinner with Maya, then heading back through Town Hall',
    extractedContext: {
      activity: 'Dinner',
      destination: 'Town Hall',
      people: ['Maya'],
      cleanedNote: 'late dinner with Maya, then heading back through Town Hall',
    },
    photoUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80',
    transportText: 'Walked to Town Hall Station',
    status: 'seen'
  },
  {
    id: 'u4',
    friendName: 'Elena Rostova',
    friendInitials: 'ER',
    friendColor: 'bg-[#f0debe] text-forest font-bold',
    timestamp: daysAgo(2, 17, 35),
    timeAgo: '2d ago',
    reason: 'Uni',
    landmark: 'UTS Library',
    attachedLocation: mapLocation('UTS Library', -33.88328, 151.20078, daysAgo(2, 17, 35)),
    note: 'study session done, grabbing matcha before train',
    extractedContext: {
      activity: 'Uni',
      destination: 'train',
      transitMode: 'train',
      cleanedNote: 'study session done, grabbing matcha before train',
    },
    photoUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80',
    status: 'seen'
  },
  {
    id: 'u5',
    friendName: 'Marcus Miller',
    friendInitials: 'MM',
    friendColor: 'bg-pink-accent text-forest font-bold',
    timestamp: daysAgo(1, 8, 20),
    timeAgo: 'Yesterday',
    reason: 'Commute',
    landmark: 'North Wollongong Station',
    attachedLocation: mapLocation('North Wollongong Station', -34.40682, 150.88779, daysAgo(1, 8, 20)),
    note: 'morning train was delayed but I made it onto the platform',
    extractedContext: {
      activity: 'Train ride',
      transitMode: 'train',
      cleanedNote: 'morning train was delayed but I made it onto the platform',
    },
    photoUrl: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?auto=format&fit=crop&w=400&q=80',
    transportText: 'South Coast Line',
    status: 'seen'
  },
  {
    id: 'u6',
    friendName: 'Sarah Chen',
    friendInitials: 'SC',
    friendColor: 'bg-azure text-forest font-bold',
    timestamp: hoursAgo(5),
    timeAgo: '5h ago',
    reason: 'Errands',
    landmark: 'Wollongong Central',
    attachedLocation: mapLocation('Wollongong Central', -34.42561, 150.89441, hoursAgo(5)),
    note: 'picked up groceries, phone low but heading home now',
    extractedContext: {
      activity: 'Errands',
      destination: 'home',
      cleanedNote: 'picked up groceries, phone low but heading home now',
    },
    photoUrl: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?auto=format&fit=crop&w=400&q=80',
    status: 'fresh'
  },
  {
    id: 'u7',
    friendName: 'Sarah Chen',
    friendInitials: 'SC',
    friendColor: 'bg-azure text-forest font-bold',
    timestamp: daysAgo(3, 22, 5),
    timeAgo: '3d ago',
    reason: 'Going Out',
    landmark: 'Crown Street',
    attachedLocation: mapLocation('Crown Street taxi rank', -34.42498, 150.89345, daysAgo(3, 22, 5)),
    note: 'leaving the gig with Priya, walking toward the taxi rank',
    extractedContext: {
      activity: 'Going out',
      destination: 'taxi rank',
      people: ['Priya'],
      transitMode: 'walk',
      cleanedNote: 'leaving the gig with Priya, walking toward the taxi rank',
    },
    photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=400&q=80',
    transportText: 'Taxi rank near Crown Street',
    status: 'seen'
  }
];
