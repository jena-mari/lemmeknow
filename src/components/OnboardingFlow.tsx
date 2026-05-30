import React, { useMemo, useState } from 'react';
import { Contact } from '../types';
import { AtSign, Camera, Check, MessageCircle, Sparkles, UserRoundPlus, Users } from 'lucide-react';

const lmkLogoUrl = new URL('../public/lemmeknow-logo.png', import.meta.url).href;

interface OnboardingFlowProps {
  onComplete: (profile: { username: string; contacts: Contact[]; sources: string[] }) => void;
}

const sourceOptions = [
  { id: 'contacts', label: 'Contacts', detail: 'Phone contacts', icon: Users },
  { id: 'instagram', label: 'Instagram', detail: 'Close friends', icon: AtSign },
  { id: 'messenger', label: 'Messenger', detail: 'Group chats', icon: MessageCircle },
];

const suggestedContacts: Contact[] = [
  {
    id: 'ob_mia',
    name: 'Mia Chen',
    relationship: 'Best Friend',
    phone: '@mia.jpeg',
    avatarColor: 'bg-azure text-forest font-bold',
    initials: 'MC',
    source: 'instagram',
  },
  {
    id: 'ob_sam',
    name: 'Sam Rivera',
    relationship: 'Roommate',
    phone: 'Messenger',
    avatarColor: 'bg-pink-accent text-forest font-bold',
    initials: 'SR',
    source: 'messenger',
  },
  {
    id: 'ob_jules',
    name: 'Jules Park',
    relationship: 'Uni Friend',
    phone: '+61 400 123 987',
    avatarColor: 'bg-yellow-orange/40 text-forest font-bold',
    initials: 'JP',
    source: 'contacts',
  },
];

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [username, setUsername] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>(['contacts']);
  const [selectedContacts, setSelectedContacts] = useState<string[]>(['ob_mia', 'ob_sam']);

  const pickedContacts = useMemo(
    () => suggestedContacts.filter((contact) => selectedContacts.includes(contact.id)),
    [selectedContacts]
  );

  const toggleSource = (id: string) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim() || 'jamie';
    onComplete({
      username: cleanUsername.startsWith('@') ? cleanUsername : `@${cleanUsername}`,
      contacts: pickedContacts,
      sources: selectedSources,
    });
  };

  return (
    <div className="h-full bg-cloud px-5 py-6 overflow-y-auto no-scrollbar">
      <form onSubmit={handleSubmit} className="min-h-full flex flex-col gap-5">
        <div className="space-y-3 text-left">
          <div className="w-24 h-14 rounded-3xl bg-white/75 border border-forest/10 shadow-sm flex items-center justify-center overflow-hidden">
            <img src={lmkLogoUrl} alt="LEMMEKNOW logo" className="w-full h-full object-contain p-2" />
          </div>
          <div className="inline-flex items-center gap-2 bg-white/80 border border-forest/10 rounded-full px-3 py-1 text-[10px] text-forest/65 font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-yellow-orange" />
            <span>Private updates, not public posts</span>
          </div>
          <div>
            <h1 className="font-serif text-4xl leading-[0.95] text-forest font-black">
              Welcome to LMK
            </h1>
            <p className="text-sm text-forest/65 mt-3 leading-relaxed">
              Make a tiny private circle, snap quick updates, and let people know what you are up to without posting anywhere public.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-forest/10 p-4 text-left space-y-2 shadow-sm">
          <label className="text-[10px] font-bold text-forest/55 uppercase tracking-wider">
            Create a username
          </label>
          <div className="flex items-center gap-2 bg-cloud/70 rounded-2xl border border-forest/5 px-3 py-2">
            <span className="text-forest/35 font-bold">@</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value.replace(/^@/, ''))}
              placeholder="jamie"
              className="bg-transparent outline-none text-forest text-sm flex-1 placeholder:text-forest/30"
            />
          </div>
        </div>

        <div className="space-y-2 text-left">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-forest">Add your people</h2>
              <p className="text-xs text-forest/55">Mock import options for the MVP.</p>
            </div>
            <span className="text-[10px] bg-azure text-forest px-2 py-1 rounded-full font-bold">
              {pickedContacts.length} picked
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {sourceOptions.map((source) => {
              const Icon = source.icon;
              const active = selectedSources.includes(source.id);
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => toggleSource(source.id)}
                  className={`rounded-2xl border p-3 text-left min-h-24 transition-all ${
                    active
                      ? 'bg-forest text-white border-forest shadow-sm'
                      : 'bg-white text-forest border-forest/10'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-4" />
                  <span className="block text-xs font-bold">{source.label}</span>
                  <span className="block text-[9px] opacity-70">{source.detail}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 text-left">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-forest/55">
            Suggested circle
          </h3>
          {suggestedContacts.map((contact) => {
            const active = selectedContacts.includes(contact.id);
            return (
              <button
                key={contact.id}
                type="button"
                onClick={() => toggleContact(contact.id)}
                className={`w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                  active ? 'bg-white border-forest/20 shadow-sm' : 'bg-white/50 border-forest/5'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${contact.avatarColor}`}>
                  {contact.initials}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-forest">{contact.name}</div>
                  <div className="text-[11px] text-forest/55">
                    {contact.relationship} · {contact.source}
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  active ? 'bg-forest text-white border-forest' : 'border-forest/15 text-transparent'
                }`}>
                  <Check className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-azure/35 rounded-3xl border border-azure/50 p-4 text-left flex gap-3">
          <UserRoundPlus className="w-5 h-5 text-forest shrink-0 mt-0.5" />
          <p className="text-xs text-forest/70 leading-relaxed">
            Suggestion: start with 2-5 people you actually message. You can add group chats, uni friends, a partner, or your usual going-out crew later.
          </p>
        </div>

        <button
          type="submit"
          className="mt-auto w-full bg-forest text-white rounded-full py-4 font-bold text-sm shadow-sm flex items-center justify-center gap-2"
        >
          <Camera className="w-4 h-4 text-yellow-orange" />
          <span>Land me in camera</span>
        </button>
      </form>
    </div>
  );
}
