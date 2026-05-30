import React, { useState, useEffect, useCallback } from 'react';
import { 
  Contact, SafetySession, CheckIn, EscalationState 
} from './types';
import { INITIAL_CONTACTS, CALMING_MOCK_PHOTOS } from './data/mockData';
import { 
  ShieldAlert, Shield, Users, Radio, Compass, Lock, Eye, CheckCircle, 
  MapPin, Clock, AlertOctagon, HelpCircle, ArrowRight, RefreshCw, X, Play, Zap 
} from 'lucide-react';

// Import components
import IosWrapper from './components/IosWrapper';
import CircleManagement from './components/CircleManagement';
import StartSessionForm from './components/StartSessionForm';
import CheckInForm from './components/CheckInForm';
import LiveSessionPanel from './components/LiveSessionPanel';
import TrustedCircleFeed from './components/TrustedCircleFeed';
import EmergencyCard from './components/EmergencyCard';

export default function App() {
  // Current active tab state inside iOS App
  const [activeTab, setActiveTab] = useState<'session' | 'feed' | 'circle'>('session');

  // Core safety session state
  const [session, setSession] = useState<SafetySession | null>(() => {
    const saved = localStorage.getItem('lmk_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Circle contacts state
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('lmk_circle_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  // User posted check-ins for the active sessions
  const [userCheckIns, setUserCheckIns] = useState<CheckIn[]>(() => {
    const saved = localStorage.getItem('lmk_user_checkins');
    return saved ? JSON.parse(saved) : [];
  });

  // Active escalation alarm index
  const [escalationState, setEscalationState] = useState<EscalationState>('SAFE');

  // Modal displays
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [showEmergencyCard, setShowEmergencyCard] = useState(false);

  // Demo walkthrough assist wizard state
  const [demoStep, setDemoStep] = useState<number>(0); // 0 = not started, 1 = Intro, 2 = Form Preloaded, 3 = Post Checkin Prompt, 4 = Success Feed demo
  const [demoAlertMessage, setDemoAlertMessage] = useState<string | null>(null);

  // Helper sync to local storage
  useEffect(() => {
    if (session) {
      localStorage.setItem('lmk_active_session', JSON.stringify(session));
    } else {
      localStorage.removeItem('lmk_active_session');
    }
  }, [session]);

  useEffect(() => {
    localStorage.setItem('lmk_circle_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('lmk_user_checkins', JSON.stringify(userCheckIns));
  }, [userCheckIns]);

  // Master timer interval effect
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    if (session && session.isActive) {
      timerId = setInterval(() => {
        setSession(prev => {
          if (!prev) return null;
          const nextSecs = prev.secondsRemaining - 1;
          
          return {
            ...prev,
            secondsRemaining: nextSecs
          };
        });
      }, 1000);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [session?.isActive]);

  // Handle auto-monitoring the timer rules for Missed Check-In Escalation Flow
  useEffect(() => {
    if (!session || !session.isActive) {
      setEscalationState('SAFE');
      return;
    }

    const recs = session.secondsRemaining;

    // State 1: Due time passed (secondsRemaining < 0)
    // State 2: Due time passed + 5 minutes (+300s overdue, i.e. secondsRemaining <= -300)
    // State 3: Due time passed + 15 minutes (+900s overdue, i.e. secondsRemaining <= -900)
    if (recs <= -900) {
      setEscalationState('ESCALATED');
    } else if (recs <= -300) {
      setEscalationState('CIRCLE_NOTIFIED');
    } else if (recs <= 0) {
      setEscalationState('REMINDER_SENT');
    } else {
      setEscalationState('SAFE');
    }
  }, [session?.secondsRemaining, session?.isActive]);

  // Handle adding a new trusted circle contact
  const handleAddContact = (newC: Contact) => {
    setContacts(prev => [...prev, newC]);
  };

  // Handle removing a contact
  const handleRemoveContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // Launch safety session
  const handleStartSession = (newSession: SafetySession) => {
    setSession(newSession);
    setUserCheckIns([]); // Clear former records
    setEscalationState('SAFE');
    setActiveTab('session');

    // If demo is running, advance it
    if (demoStep === 2) {
      setDemoStep(3);
      setDemoAlertMessage("🚀 Session is starting! Now, click 'Post Initial BeReal Context' below to post the Crown Street photo check-in.");
    }
  };

  // End active safety check-in session cleanly
  const handleEndSession = () => {
    if (window.confirm("Are you sure you want to successfully wrap up your transit safety session? Doing so clears active alarms.")) {
      setSession(null);
      setUserCheckIns([]);
      setEscalationState('SAFE');
      setDemoStep(0);
      setDemoAlertMessage(null);
      setActiveTab('session');
    }
  };

  // Post Check-In update
  const handlePostCheckIn = (pData: Omit<CheckIn, 'id' | 'timestamp'>) => {
    const now = new Date();
    const newCi: CheckIn = {
      id: `ci_${Date.now()}`,
      timestamp: now.toISOString(),
      ...pData
    };

    setUserCheckIns(prev => [newCi, ...prev]);
    setShowCheckInForm(false);

    // Push check-in resets timer
    if (session) {
      const nextDue = new Date(now.getTime() + session.intervalMinutes * 60000);
      setSession(prev => prev ? {
        ...prev,
        checkInDueAt: nextDue.toISOString(),
        secondsRemaining: prev.intervalMinutes * 60
      } : null);
    }

    // Direct tab switch to circle timeline feed to highlight success
    setActiveTab('feed');

    if (demoStep === 3) {
      setDemoStep(4);
      setDemoAlertMessage("🎉 Epic! You successfully posted the private check-in. It now shows in the Trusted Circle feed below. Your friends see you are on track from Crown Street!");
    }
  };

  // Manual fast forward/time booster for demos
  const handleAdvanceTime = (minutes: number) => {
    if (!session) return;
    setSession(prev => prev ? {
      ...prev,
      secondsRemaining: prev.secondsRemaining - (minutes * 60)
    } : null);
  };

  // Trigger Immediate Emergency Panic
  const handleTriggerEmergency = () => {
    setEscalationState('ESCALATED');
    // Force negative time to prompt escalation view
    if (session) {
      setSession(prev => prev ? {
        ...prev,
        secondsRemaining: -950 // over 15 minutes overdue
      } : null);
    }
    setShowEmergencyCard(true);
  };

  // Auto-run/Fast Preset configure for the specific Wollongong late student demo
  const handleLoadDemoPreset = () => {
    setDemoStep(1); // Set demo sequence started
    setDemoAlertMessage("👋 Wollongong student scenario initialized. Click 'Load Travel Credentials' to prefill Uber & location notes!");
  };

  const executeDemoPrefill = () => {
    setDemoStep(2);
    setDemoAlertMessage("📝 Journey filled in. View parameters: 30-min interval, Wollongong Crown Street departure, Honda Civic Plate ABC123. Now click the green button 'Activate Safety Session'!");
    
    // Quick focus to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const dismissDemoAlert = () => {
    setDemoAlertMessage(null);
  };

  return (
    <IosWrapper>
      {/* Top Banner App Branding */}
      <div className="bg-azure/85 pt-4 pb-3.5 px-4 rounded-b-[32px] border-b border-forest/10 flex items-center justify-between text-left shrink-0 z-10 shadow-3xs">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 bg-forest text-azure rounded-xl flex items-center justify-center font-serif font-black text-sm">
            L
          </div>
          <div>
            <h1 className="font-serif text-lg font-extrabold text-forest uppercase tracking-tight leading-none">
              LEMMEKNOW
            </h1>
            <span className="text-[9px] text-forest/70 font-mono tracking-wide">
              🔒 Private Circle Safety
            </span>
          </div>
        </div>

        {/* Real-time safety status indicator badge */}
        {session && session.isActive ? (
          <span className="text-[10px] bg-forest text-[#f7f2e8] px-2 py-0.5 rounded-full font-semibold animate-pulse shadow-2xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-yellow-orange rounded-full" />
            <span>Traveling Live</span>
          </span>
        ) : (
          <span className="text-[10px] bg-white/70 text-forest/70 border border-forest/10 px-2.5 py-0.5 rounded-full font-medium">
            Standby
          </span>
        )}
      </div>

      {/* DEMO GUIDE WIZARD PANEL (Always present, acts as the ultimate presentation partner) */}
      <div className="p-4 mx-4 mt-3 bg-white rounded-3xl border border-forest/15 space-y-2.5 shadow-sm text-left">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-yellow-orange fill-yellow-orange/20" />
            <h4 className="font-serif text-xs font-black uppercase text-forest tracking-wider">
              MVP Scenario Presenter
            </h4>
          </div>
          {demoStep > 0 && (
            <button 
              onClick={() => { setDemoStep(0); setDemoAlertMessage(null); }}
              className="text-[9px] text-forest/40 hover:text-forest underline"
            >
              Reset Walkthrough
            </button>
          )}
        </div>

        {/* Presenter Steps timeline buttons */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[10px] font-medium text-forest/70">
          <button
            onClick={handleLoadDemoPreset}
            className={`px-2.5 py-1 rounded-full border shrink-0 cursor-pointer ${
              demoStep === 1 ? 'bg-forest text-white border-forest' : 'bg-cloud border-forest/5'
            }`}
          >
            1. Setup Story
          </button>
          <button
            onClick={executeDemoPrefill}
            disabled={demoStep < 1}
            className={`px-2.5 py-1 rounded-full border shrink-0 cursor-pointer ${
              demoStep === 2 ? 'bg-forest text-white border-forest' : 'bg-cloud border-forest/5 disabled:opacity-40'
            }`}
          >
            2. Autofill LMK
          </button>
          <button
            disabled={demoStep < 2}
            onClick={() => {
              if (session) {
                setShowCheckInForm(true);
              } else {
                alert("Please start the session first in step 2!");
              }
            }}
            className={`px-2.5 py-1 rounded-full border shrink-0 cursor-pointer ${
              demoStep === 3 ? 'bg-forest text-white border-forest' : 'bg-cloud border-forest/5 disabled:opacity-40'
            }`}
          >
            3. Snap Picture
          </button>
          <button
            disabled={demoStep < 4}
            onClick={() => setActiveTab('feed')}
            className={`px-2.5 py-1 rounded-full border shrink-0 cursor-pointer ${
              demoStep === 4 ? 'bg-[#124224] text-[#f7f2e8] border-[#124224]' : 'bg-cloud border-forest/5 disabled:opacity-40'
            }`}
          >
            4. Verify Feed
          </button>
        </div>

        {/* Narrative / Context slide box */}
        {demoStep === 0 ? (
          <div className="p-2.5 bg-azure/20 border border-azure/40 rounded-xl">
            <p className="text-[11px] text-forest/85 leading-relaxed">
              🎓 <strong>Demo Scenario:</strong> A student leaves Wollongong late at night and rides home in an Uber. Click <strong>"1. Setup Story"</strong> to initiate the narrative journey.
            </p>
          </div>
        ) : (
          <div className="p-2.5 bg-yellow-orange/10 border border-yellow-orange/35 rounded-xl space-y-1 relative">
            <p className="text-[11px] text-forest/90 leading-relaxed font-semibold">
              {demoStep === 1 && "💡 Wollongong Student finishes shift late. Next step: Click '2. Autofill LMK' or tap below to auto-populate travel particulars / vehicle model info."}
              {demoStep === 2 && "📝 Travel parameters preloaded! Observe plate number ABC123 and 'Leaving Crown Street' landmarks. Next step: Click the Activate button on the form below!"}
              {demoStep === 3 && "📸 Live safety session activated! Next step: Post a mock photo check-in. Tap 'Check-in Safe Now' inside the session pane or click step 3 above."}
              {demoStep === 4 && "🌟 Success! The photo check-in has been dispatched to the timeline feed. Your trusted contacts see it straight away without surveillance creep!"}
            </p>
            {demoStep === 1 && (
              <button
                onClick={executeDemoPrefill}
                className="mt-1 px-3 py-1 bg-yellow-orange text-forest text-[10px] font-bold rounded-lg flex items-center gap-1 shadow-2xs hover:bg-yellow-orange/90"
              >
                <span>Autofill LMK Card Parameters</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main interactive tabs viewport area */}
      <div className="flex-1 p-4 space-y-4">
        {/* TAB 1: SAFETY SESSION TAB */}
        {activeTab === 'session' && (
          <div className="space-y-4">
            {session && session.isActive ? (
              <LiveSessionPanel
                session={session}
                escalationState={escalationState}
                onPostNewCheckInTrigger={() => setShowCheckInForm(true)}
                onEndSession={handleEndSession}
                onTriggerEmergency={handleTriggerEmergency}
                onAdvanceTime={handleAdvanceTime}
              />
            ) : (
              <StartSessionForm
                onStartSession={handleStartSession}
                onLoadDemoPreset={handleLoadDemoPreset}
              />
            )}
          </div>
        )}

        {/* TAB 2: TIMELINE CIRCLE FEED */}
        {activeTab === 'feed' && (
          <TrustedCircleFeed
            userCheckIns={userCheckIns}
            activeSession={session}
            escalationState={escalationState}
            onOpenEmergencyCard={() => setShowEmergencyCard(true)}
            onSendNudge={() => alert("🔔 Sweet nudge sent to your friends! Rest assured, they're looking out.")}
          />
        )}

        {/* TAB 3: TRUSTED CONTACTS LIST */}
        {activeTab === 'circle' && (
          <CircleManagement
            contacts={contacts}
            onAddContact={handleAddContact}
            onRemoveContact={handleRemoveContact}
          />
        )}
      </div>

      {/* MODAL / BOTTOM SHEET SUB_VIEWS */}
      {showCheckInForm && (
        <div className="fixed inset-0 bg-forest/70 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-cloud w-full max-w-[393px] max-h-[82%] rounded-t-[40px] p-5 shadow-2xl overflow-y-auto no-scrollbar border-t-2 border-forest/15 animate-slideUp">
            <div className="w-12 h-1.5 bg-forest/35 rounded-full mx-auto mb-4" />
            <CheckInForm
              onPostCheckIn={handlePostCheckIn}
              onCancel={() => setShowCheckInForm(false)}
              initialLandmark={demoStep === 3 ? "Leaving Crown Street, Wollongong" : session?.landmark}
              initialPlates={demoStep === 3 ? "ABC123" : session?.transportDetails.plates}
              initialModel={demoStep === 3 ? "Honda Civic" : session?.transportDetails.model}
              locationSharingOption={session?.locationSharingOption}
              preciseCoordinates={session?.preciseCoordinates}
              approximateRegion={session?.approximateRegion}
            />
          </div>
        </div>
      )}

      {showEmergencyCard && (
        <EmergencyCard
          session={session}
          lastCheckIn={userCheckIns[0] || null}
          contacts={contacts}
          onClose={() => setShowEmergencyCard(false)}
        />
      )}

      {/* Elegant Standard iOS Tab Navigation Bar */}
      <div className="h-20 bg-white border-t border-forest/10 flex items-center justify-around px-2 shadow-inner shrink-0 relative z-30">
        <button
          onClick={() => setActiveTab('session')}
          className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'session' ? 'text-forest font-bold' : 'text-forest/40 font-medium'
          }`}
          id="tab-btn-session"
        >
          <Compass className={`w-5 h-5 ${activeTab === 'session' ? 'stroke-[2.5]' : 'stroke-1.5'}`} />
          <span className="text-[10px] tracking-wide">My Ride</span>
        </button>

        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center gap-1.5 transition-colors relative cursor-pointer ${
            activeTab === 'feed' ? 'text-forest font-bold' : 'text-forest/40 font-medium'
          }`}
          id="tab-btn-feed"
        >
          <Radio className={`w-5 h-5 ${activeTab === 'feed' ? 'stroke-[2.5]' : 'stroke-1.5'}`} />
          <span className="text-[10px] tracking-wide">Circle Feed</span>
          {session && userCheckIns.length === 0 && (
            <span className="absolute -top-1.5 -right-1 w-2.5 h-2.5 bg-yellow-orange rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('circle')}
          className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
            activeTab === 'circle' ? 'text-forest font-bold' : 'text-forest/40 font-medium'
          }`}
          id="tab-btn-contacts"
        >
          <Users className={`w-5 h-5 ${activeTab === 'circle' ? 'stroke-[2.5]' : 'stroke-1.5'}`} />
          <span className="text-[10px] tracking-wide">Contacts</span>
        </button>
      </div>
    </IosWrapper>
  );
}
