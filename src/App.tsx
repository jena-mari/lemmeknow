import React, { useEffect, useState } from 'react';
import { Camera, ChevronDown, CircleEllipsis, Cloud, Images, Lock, UserRoundPlus, Users } from 'lucide-react';
import { Contact, CheckIn } from './types';
import { INITIAL_CONTACTS } from './data/mockData';

import IosWrapper from './components/IosWrapper';
import CircleManagement from './components/CircleManagement';
import CheckInForm from './components/CheckInForm';
import TrustedCircleFeed from './components/TrustedCircleFeed';
import OnboardingFlow from './components/OnboardingFlow';
import SafetyScreen from './components/SafetyScreen';

type Tab = 'camera' | 'updates' | 'circle' | 'more';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('camera');
  const [username, setUsername] = useState<string>(() => localStorage.getItem('lmk_username') || '@jamie');
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => localStorage.getItem('lmk_has_onboarded') === 'true');
  const [connectedSources, setConnectedSources] = useState<string[]>(() => {
    const saved = localStorage.getItem('lmk_connected_sources');
    return saved ? JSON.parse(saved) : ['contacts'];
  });
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('lmk_circle_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });
  const [updates, setUpdates] = useState<CheckIn[]>(() => {
    const saved = localStorage.getItem('lmk_user_checkins');
    return saved ? JSON.parse(saved) : [];
  });
  const [showPrivateControls, setShowPrivateControls] = useState(false);

  useEffect(() => {
    localStorage.setItem('lmk_circle_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('lmk_user_checkins', JSON.stringify(updates));
  }, [updates]);

  useEffect(() => {
    localStorage.setItem('lmk_username', username);
    localStorage.setItem('lmk_has_onboarded', String(hasOnboarded));
    localStorage.setItem('lmk_connected_sources', JSON.stringify(connectedSources));
  }, [username, hasOnboarded, connectedSources]);

  const handleFinishOnboarding = (profile: { username: string; contacts: Contact[]; sources: string[] }) => {
    setUsername(profile.username);
    setConnectedSources(profile.sources);
    setContacts((prev) => {
      const existing = new Set(prev.map((contact) => contact.id));
      const incoming = profile.contacts.filter((contact) => !existing.has(contact.id));
      return [...incoming, ...prev];
    });
    setHasOnboarded(true);
    setActiveTab('camera');
  };

  const handlePostUpdate = (update: Omit<CheckIn, 'id' | 'timestamp'>) => {
    const newInstant: CheckIn = {
      id: `update_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...update,
    };

    setUpdates((prev) => [newInstant, ...prev]);
    setActiveTab('updates');
  };

  const handleAddContact = (contact: Contact) => {
    setContacts((prev) => [...prev, contact]);
  };

  const handleRemoveContact = (id: string) => {
    setContacts((prev) => prev.filter((contact) => contact.id !== id));
  };

  const handleDeleteUpdate = (id: string) => {
    setUpdates((prev) => prev.filter((update) => update.id !== id));
  };

  const handleUpdatePrivacy = (id: string, changes: { hideLocation?: boolean; visibility?: 'circle' | 'only_me' }) => {
    setUpdates((prev) => prev.map((update) => (
      update.id === id ? { ...update, ...changes } : update
    )));
  };

  if (!hasOnboarded) {
    return (
      <IosWrapper>
        <OnboardingFlow onComplete={handleFinishOnboarding} />
      </IosWrapper>
    );
  }

  return (
    <IosWrapper>
      {activeTab !== 'camera' && (
      <div className="shrink-0 bg-azure px-4 pt-4 pb-3 text-left">
        <div className="mx-auto flex max-w-[390px] items-center justify-between gap-2 rounded-full border border-white/80 bg-white/78 px-2 py-2 shadow-sm backdrop-blur">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-11 items-center justify-center rounded-full bg-yellow-orange text-brand-black">
              <Cloud className="h-[18px] w-[18px] stroke-[2.25]" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-[17px] font-black uppercase text-brand-black">
                LMK
              </h1>
              <span className="flex items-center gap-1 truncate text-[9px] font-bold text-brand-black/70">
                <Lock className="h-2.5 w-2.5 shrink-0" />
                <span className="truncate">{username} · close circle</span>
              </span>
            </div>
          </div>
          <div className="flex -space-x-2">
            {contacts.slice(0, 3).map((contact) => (
              <span
                key={contact.id}
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[8px] font-black ${contact.avatarColor}`}
              >
                {contact.initials}
              </span>
            ))}
          </div>
        </div>
      </div>
      )}

      <main className="flex-1 overflow-y-auto bg-azure p-4 no-scrollbar">
        {activeTab === 'camera' && (
          <CheckInForm
            onPostCheckIn={handlePostUpdate}
            onCancel={() => setActiveTab('updates')}
            username={username}
          />
        )}

        {activeTab === 'updates' && (
          <TrustedCircleFeed
            userCheckIns={updates}
            contacts={contacts}
            onOpenCamera={() => setActiveTab('camera')}
            onDeleteUpdate={handleDeleteUpdate}
            onUpdatePrivacy={handleUpdatePrivacy}
          />
        )}

        {activeTab === 'circle' && (
          <CircleManagement
            contacts={contacts}
            onAddContact={handleAddContact}
            onRemoveContact={handleRemoveContact}
          />
        )}

        {activeTab === 'more' && (
          <div className="lmk-page -mx-4 -my-4 min-h-full px-4 py-6 text-center">
            <div className="lmk-shell space-y-4">
            <section className="relative z-10">
              <div className="mb-4 flex justify-center">
                <span className="flex h-12 w-16 items-center justify-center rounded-full bg-yellow-orange text-brand-black shadow-sm">
                  <CircleEllipsis className="h-5 w-5" />
                </span>
              </div>
              <h2 className="text-[34px] font-black text-brand-black">More</h2>
              <p className="mx-auto mt-2 max-w-[260px] text-[15px] font-medium text-brand-black">
                LMK keeps your private Updates reviewable by your circle when they need context.
              </p>
            </section>

            <section className="lmk-panel relative z-10 p-4 text-left">
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-black text-brand-black">Imports</h3>
                <div className="flex flex-wrap gap-2">
                  {connectedSources.map((source) => (
                    <span key={source} className="rounded-full bg-light-green/80 px-3 py-1.5 text-[10px] font-black capitalize text-forest">
                      {source}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowPrivateControls((open) => !open)}
                className="flex w-full items-center justify-between rounded-[24px] bg-white/68 px-4 py-3 text-left"
              >
                <div>
                  <h3 className="text-sm font-black text-brand-black">Private controls</h3>
                  <p className="mt-1 text-xs font-bold text-brand-black/65">Hidden until you need them.</p>
                </div>
                <ChevronDown className={`h-5 w-5 text-brand-black/65 transition-transform ${showPrivateControls ? 'rotate-180' : ''}`} />
              </button>

              {showPrivateControls && (
                <div className="mt-4 space-y-2">
                  <div className="px-1 text-[10px] font-black uppercase text-brand-black/55">
                    Danger zone
                  </div>
                  <button
                    type="button"
                    onClick={() => setUpdates([])}
                    className="w-full rounded-[20px] bg-white/80 px-4 py-3 text-left text-xs font-black text-brand-black"
                  >
                    Clear updates on this device
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.clear();
                      setHasOnboarded(false);
                      setActiveTab('camera');
                    }}
                    className="w-full rounded-[20px] bg-pink-accent/45 px-4 py-3 text-left text-xs font-black text-brand-black"
                  >
                    Start over
                  </button>
                </div>
              )}
            </section>

            <SafetyScreen
              updates={updates}
              onOpenUpdates={() => setActiveTab('updates')}
            />
            </div>
          </div>
        )}
      </main>

      <nav className="relative z-30 mx-3 mb-3 grid h-[74px] shrink-0 grid-cols-4 rounded-full border border-white/85 bg-white/86 px-2 shadow-[0_12px_32px_rgba(18,66,36,0.12)] backdrop-blur">
        {[
          { id: 'camera' as const, label: 'Camera', icon: Camera },
          { id: 'updates' as const, label: 'Updates', icon: Images },
          { id: 'circle' as const, label: 'Circle', icon: Users },
          { id: 'more' as const, label: 'More', icon: UserRoundPlus },
        ].map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                active ? 'text-brand-black' : 'text-brand-black/48'
              }`}
            >
              <span className={`flex h-8 w-12 items-center justify-center rounded-full ${active ? 'bg-yellow-orange' : 'bg-transparent'}`}>
                <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : 'stroke-1.5'}`} />
              </span>
              <span className="text-[10px] font-bold">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </IosWrapper>
  );
}
