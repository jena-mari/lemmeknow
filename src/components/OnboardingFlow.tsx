import React, { useMemo, useState } from 'react';
import { Contact } from '../types';
import { ArrowLeft, AtSign, Check, Cloud, MessageCircle, Users } from 'lucide-react';

const sceneryUrl = new URL('../public/scenery.png', import.meta.url).href;

interface OnboardingFlowProps {
  onComplete: (profile: { username: string; contacts: Contact[]; sources: string[] }) => void;
}

const sourceOptions = [
  { id: 'contacts', label: 'Contacts', icon: Users },
  { id: 'instagram', label: 'Instagram', icon: AtSign },
  { id: 'messenger', label: 'Messenger', icon: MessageCircle },
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
  const [step, setStep] = useState<'welcome' | 'username' | 'people'>('welcome');
  const [username, setUsername] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>(['contacts']);
  const [selectedContacts, setSelectedContacts] = useState<string[]>(['ob_mia', 'ob_sam']);

  const pickedContacts = useMemo(
    () => suggestedContacts.filter((contact) => selectedContacts.includes(contact.id)),
    [selectedContacts]
  );

  const finish = () => {
    const cleanUsername = username.trim() || 'jamie';
    onComplete({
      username: cleanUsername.startsWith('@') ? cleanUsername : `@${cleanUsername}`,
      contacts: pickedContacts,
      sources: selectedSources,
    });
  };

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

  const goBack = () => {
    setStep((current) => {
      if (current === 'people') return 'username';
      if (current === 'username') return 'welcome';
      return current;
    });
  };

  return (
    <div className="lmk-sky-page flex h-full flex-col px-5 py-6">
      <div className="relative z-20 mb-4 grid grid-cols-[44px_1fr_44px] items-center">
        {step !== 'welcome' ? (
          <button
            type="button"
            onClick={goBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/82 text-brand-black shadow-sm backdrop-blur"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 stroke-[2.4]" />
          </button>
        ) : (
          <span />
        )}

        <div className="flex justify-center gap-1.5">
          {['welcome', 'username', 'people'].map((item) => (
            <span
              key={item}
              className={`h-1.5 rounded-full transition-all ${step === item ? 'w-8 bg-brand-black' : 'w-2 bg-brand-black/25'}`}
            />
          ))}
        </div>

        <span />
      </div>

      {step === 'welcome' && (
        <section className="relative z-10 -mx-5 -my-6 flex flex-1 flex-col items-center justify-center overflow-hidden bg-[#cce6fc] px-6 pb-[210px] pt-10 text-center">
          <div className="lmk-shell">
            <div className="mb-10 flex justify-center text-brand-black">
              <Cloud className="h-16 w-24 stroke-[2.6]" />
            </div>
            <h1 className="mx-auto max-w-[340px] text-[48px] font-normal leading-[0.84] text-black">
              <span className="font-black">Lemme</span>know
              <br />
              you&apos;re safe.
            </h1>
            <p className="mx-auto mt-7 max-w-[300px] text-[19px] font-medium text-black">
              A private, consent-first check-in app.
            </p>
            <button
              type="button"
              onClick={() => setStep('username')}
              className="lmk-primary mt-9 h-[68px] w-full max-w-[360px] bg-yellow-orange text-[20px] font-medium text-black"
            >
              Get Started
            </button>
          </div>
          <img
            src={sceneryUrl}
            alt=""
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[230px] w-full object-cover"
          />
        </section>
      )}

      {step === 'username' && (
        <section className="relative z-10 -mx-5 -mb-6 flex flex-1 flex-col items-center justify-center overflow-hidden px-6 pb-[180px] pt-3 text-center">
          <div className="lmk-shell">
            <Cloud className="mx-auto mb-8 h-14 w-[88px] stroke-[2.45] text-brand-black" />
            <h1 className="text-[40px] font-black text-brand-black">Choose a username</h1>
            <p className="mx-auto mt-3 max-w-[280px] text-[16px] font-medium text-brand-black">
              Keep it simple. You can change it later.
            </p>

            <label className="mt-8 block text-[12px] font-black uppercase text-brand-black/65">Username</label>
            <div className="mt-2 flex items-center gap-2 rounded-[28px] border border-white/80 bg-white/78 px-5 py-4 text-left shadow-sm backdrop-blur">
              <span className="font-black text-brand-black/60">@</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value.replace(/^@/, ''))}
                placeholder="jamie"
                className="min-w-0 flex-1 bg-transparent text-[22px] font-black text-brand-black outline-none placeholder:text-brand-black/25"
                autoFocus
              />
            </div>

            <button
              type="button"
              onClick={() => setStep('people')}
              className="lmk-primary mt-7 h-[64px] w-full bg-yellow-orange text-[19px] font-medium text-black"
            >
              Next
            </button>
          </div>
          <img
            src={sceneryUrl}
            alt=""
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[170px] w-full object-cover"
          />
        </section>
      )}

      {step === 'people' && (
        <section className="relative z-10 -mx-5 -mb-6 flex flex-1 flex-col items-center justify-center overflow-hidden px-6 pb-[126px] pt-1 text-center">
          <div className="lmk-shell">
            <Cloud className="mx-auto mb-5 h-10 w-16 stroke-[2.45] text-brand-black" />
            <h1 className="text-[38px] font-black text-brand-black">Add your people</h1>
            <p className="mx-auto mt-2 max-w-[250px] text-[15px] font-medium text-brand-black">Pick a few close contacts.</p>

            <div className="my-5 grid grid-cols-3 gap-2">
              {sourceOptions.map((source) => {
                const Icon = source.icon;
                const active = selectedSources.includes(source.id);
                return (
                  <button
                    key={source.id}
                    type="button"
                    onClick={() => toggleSource(source.id)}
                    className={`rounded-[22px] border p-3 text-center shadow-sm transition-all ${
                      active ? 'border-yellow-orange bg-yellow-orange text-brand-black' : 'border-white/80 bg-white/72 text-brand-black'
                    }`}
                  >
                    <Icon className="mx-auto mb-2 h-5 w-5" />
                    <span className="text-[10px] font-black">{source.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-2">
              {suggestedContacts.map((contact) => {
                const active = selectedContacts.includes(contact.id);
                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => toggleContact(contact.id)}
                    className={`flex w-full items-center gap-3 rounded-[26px] border p-3 text-left shadow-sm backdrop-blur transition-all ${
                      active ? 'border-white bg-white/90' : 'border-white/70 bg-white/58'
                    }`}
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm ${contact.avatarColor}`}>
                      {contact.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-black text-brand-black">{contact.name}</div>
                      <div className="truncate text-xs font-bold text-brand-black/65">{contact.relationship}</div>
                    </div>
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full ${
                      active ? 'bg-forest text-white' : 'bg-brand-black/5 text-transparent'
                    }`}>
                      <Check className="h-4 w-4" />
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={finish}
              className="lmk-primary mt-6 h-[62px] w-full bg-yellow-orange text-[19px] font-medium text-black"
            >
              Next
            </button>
          </div>
          <img
            src={sceneryUrl}
            alt=""
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[125px] w-full object-cover"
          />
        </section>
      )}
    </div>
  );
}
