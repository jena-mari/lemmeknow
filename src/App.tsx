import React, { useState, useEffect } from 'react';
import { Contact, SafetySession, CheckIn, EscalationState } from './types';
import { INITIAL_CONTACTS } from './data/mockData';
import { Camera, Users, Shield, ShieldAlert } from 'lucide-react';

import IosWrapper from './components/IosWrapper';
import OnboardingFlow from './components/OnboardingFlow';
import CircleManagement from './components/CircleManagement';
import CameraViewfinder from './components/CameraViewfinder';
import CaptionEditor from './CaptionEditor';
import InstantsGrid from './components/InstantsGrid';
import SafetyScreen from './components/SafetyScreen';

const lmkLogoUrl = new URL('./public/lemmeknow-logo.png', import.meta.url).href;

type Tab = 'camera' | 'instants' | 'circle' | 'safety';
type CameraStep = 'viewfinder' | 'preview';

export default function App() {
  // ── Navigation ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<Tab>('camera');
  const [cameraStep, setCameraStep] = useState<CameraStep>('viewfinder');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // ── User / onboarding ──────────────────────────────────────────────────────
  const [username, setUsername] = useState<string>(
    () => localStorage.getItem('lmk_username') || ''
  );
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(
    () => localStorage.getItem('lmk_has_onboarded') === 'true'
  );

  // ── Circle contacts ────────────────────────────────────────────────────────
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('lmk_circle_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  // ── Safety session ─────────────────────────────────────────────────────────
  const [session, setSession] = useState<SafetySession | null>(() => {
    const saved = localStorage.getItem('lmk_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  // ── Check-ins ──────────────────────────────────────────────────────────────
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => {
    const saved = localStorage.getItem('lmk_user_checkins');
    return saved ? JSON.parse(saved) : [];
  });

  // ── Escalation state ───────────────────────────────────────────────────────
  const [escalationState, setEscalationState] = useState<EscalationState>('SAFE');

  // ── Persistence effects ────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('lmk_username', username);
    localStorage.setItem('lmk_has_onboarded', String(hasOnboarded));
  }, [username, hasOnboarded]);

  useEffect(() => {
    localStorage.setItem('lmk_circle_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    if (session) localStorage.setItem('lmk_active_session', JSON.stringify(session));
    else localStorage.removeItem('lmk_active_session');
  }, [session]);

  useEffect(() => {
    localStorage.setItem('lmk_user_checkins', JSON.stringify(checkIns));
  }, [checkIns]);

  // ── Session countdown timer ────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.isActive) return;
    const t = setInterval(() => {
      setSession(prev =>
        prev ? { ...prev, secondsRemaining: prev.secondsRemaining - 1 } : null
      );
    }, 1000);
    return () => clearInterval(t);
  }, [session?.isActive]);

  // ── Escalation ladder ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.isActive) { setEscalationState('SAFE'); return; }
    const s = session.secondsRemaining;
    if (s <= -1800)      setEscalationState('ESCALATED');
    else if (s <= -900)  setEscalationState('CIRCLE_NOTIFIED');
    else if (s <= 0)     setEscalationState('REMINDER_SENT');
    else                 setEscalationState('SAFE');
  }, [session?.secondsRemaining, session?.isActive]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleOnboardingComplete = (profile: {
    username: string;
    contacts: Contact[];
    sources: string[];
  }) => {
    setUsername(profile.username);
    setContacts(prev => {
      const existing = new Set(prev.map(c => c.id));
      return [...profile.contacts.filter(c => !existing.has(c.id)), ...prev];
    });
    setHasOnboarded(true);
  };

  const handleCapture = (photoUrl: string) => {
    setCapturedPhoto(photoUrl);
    setCameraStep('preview');
  };

  const handlePost = (data: Omit<CheckIn, 'id' | 'timestamp'>) => {
    const newCi: CheckIn = {
      id: `ci_${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...data,
    };
    setCheckIns(prev => [newCi, ...prev]);
    setCameraStep('viewfinder');
    setCapturedPhoto(null);
    // Reset session timer on successful post
    if (session) {
      setSession(prev =>
        prev
          ? {
              ...prev,
              secondsRemaining: prev.intervalMinutes * 60,
              checkInDueAt: new Date(Date.now() + prev.intervalMinutes * 60000).toISOString(),
            }
          : null
      );
    }
    setActiveTab('instants');
  };

  const handleStartSession = (s: SafetySession) => {
    setSession(s);
    setEscalationState('SAFE');
  };

  const handleEndSession = () => {
    if (window.confirm('End this safety session?')) {
      setSession(null);
      setEscalationState('SAFE');
    }
  };

  // ── Onboarding gate ────────────────────────────────────────────────────────
  if (!hasOnboarded) {
    return (
      <IosWrapper>
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </IosWrapper>
    );
  }

  // ── Tabs config ────────────────────────────────────────────────────────────
  const tabs: Array<{
    id: Tab;
    label: string;
    Icon: React.ElementType;
    badge?: boolean;
    alert?: boolean;
  }> = [
    { id: 'camera',   label: 'Camera',  Icon: Camera },
    { id: 'instants', label: 'Circle',  Icon: Users, badge: checkIns.length > 0 },
    { id: 'circle',   label: 'Friends', Icon: Users },
    {
      id: 'safety',
      label: 'Safety',
      Icon: escalationState !== 'SAFE' ? ShieldAlert : Shield,
      alert: escalationState !== 'SAFE',
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <IosWrapper>
      <div className="flex flex-col h-full overflow-hidden">

        {/* Header */}
        <div className="shrink-0 bg-cloud/90 backdrop-blur-sm pt-3 pb-2 px-4 flex items-center justify-between border-b border-forest/8 z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white rounded-xl overflow-hidden border border-forest/10 flex items-center justify-center shadow-sm">
              <img src={lmkLogoUrl} alt="LMK" className="w-full h-full object-contain p-0.5" />
            </div>
            <span className="font-serif text-forest font-extrabold text-base uppercase tracking-tight">
              LEMMEKNOW
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-forest/50 text-[11px]">{username}</span>
            {session?.isActive && (
              <span className="w-2 h-2 rounded-full bg-yellow-orange animate-pulse" />
            )}
          </div>
        </div>

        {/* Screen content */}
        {activeTab === 'camera' && (
          <div className="flex flex-col flex-1 px-3 pt-3 pb-2 gap-3 overflow-hidden">
            {cameraStep === 'viewfinder' && (
              <CameraViewfinder session={session} onCapture={handleCapture} />
            )}
            {cameraStep === 'preview' && capturedPhoto && (
              <CaptionEditor
                photoUrl={capturedPhoto}
                session={session}
                onPost={handlePost}
                onRetake={() => { setCameraStep('viewfinder'); setCapturedPhoto(null); }}
              />
            )}
          </div>
        )}

        {activeTab === 'instants' && (
          <InstantsGrid checkIns={checkIns} contacts={contacts} session={session} />
        )}

        {activeTab === 'circle' && (
          <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-2">
            <CircleManagement
              contacts={contacts}
              onAddContact={(c: Contact) => setContacts(prev => [...prev, c])}
              onRemoveContact={(id: string) => setContacts(prev => prev.filter(c => c.id !== id))}
            />
          </div>
        )}

        {activeTab === 'safety' && (
          <SafetyScreen
            session={session}
            escalationState={escalationState}
            onStartSession={handleStartSession}
            onEndSession={handleEndSession}
          />
        )}

        {/* Tab bar */}
        <div className="shrink-0 h-[68px] bg-white border-t border-forest/8 flex items-center justify-around px-2 z-20">
          {tabs.map(({ id, label, Icon, badge, alert }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`relative flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  isActive ? 'text-forest' : 'text-forest/35'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'}`} />
                <span className="text-[10px] tracking-wide">{label}</span>
                {badge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-yellow-orange" />
                )}
                {alert && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

      </div>
    </IosWrapper>
  );
}
