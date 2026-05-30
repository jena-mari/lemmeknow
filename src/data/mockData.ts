import { Contact, MockUpdate } from '../types';

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000).toISOString();
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number, hour = 18, minute = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

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
    note: 'walking with Sarah now, tiny night-out update',
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
    note: 'Boarded the South Coast line train. Reading a book, phone is on 82%. See you guys soon!',
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
    note: 'late dinner with Maya, then heading back through Town Hall',
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
    note: 'study session done, grabbing matcha before train',
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
    note: 'morning train was delayed but I made it onto the platform',
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
    note: 'picked up groceries, phone low but heading home now',
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
    note: 'leaving the gig with Priya, walking toward the taxi rank',
    photoUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=400&q=80',
    transportText: 'Taxi rank near Crown Street',
    status: 'seen'
  }
];
