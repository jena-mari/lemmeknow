import React, { useState, useEffect } from 'react';
import { SafetySession, LocationSharingOption } from '../types';
import { 
  Car, MapPin, Sparkles, Briefcase, Glasses, HelpCircle, 
  Clock, ShieldAlert, Navigation, ArrowRight, Shield, Globe, Landmark, Plus, Trash2, Heart
} from 'lucide-react';

interface StartSessionFormProps {
  onStartSession: (session: SafetySession) => void;
  onLoadDemoPreset: () => void;
}

export default function StartSessionForm({
  onStartSession,
  onLoadDemoPreset
}: StartSessionFormProps) {
  const [reason, setReason] = useState<string>('Travelling');
  const [interval, setInterval] = useState<number>(30);
  const [landmark, setLandmark] = useState('');
  const [initialNote, setInitialNote] = useState('');
  const [plates, setPlates] = useState('');
  const [model, setModel] = useState('');

  // Location Sharing state
  const [locationOption, setLocationOption] = useState<LocationSharingOption>('approximate');

  // Custom Saved Reasons persistence
  const [savedReasons, setSavedReasons] = useState<{ name: string; iconName: string }[]>(() => {
    const saved = localStorage.getItem('lmk_saved_reasons');
    return saved ? JSON.parse(saved) : [
      { name: 'Evening Walk 🚶‍♀️', iconName: 'walk' },
      { name: 'Jogging Path 🏃‍♂️', iconName: 'run' }
    ];
  });
  
  const [newReasonName, setNewReasonName] = useState('');

  useEffect(() => {
    localStorage.setItem('lmk_saved_reasons', JSON.stringify(savedReasons));
  }, [savedReasons]);

  const handleCreateReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReasonName.trim()) return;
    
    const nameClean = newReasonName.trim();
    // Verify duplicate
    if (!savedReasons.some(r => r.name.toLowerCase() === nameClean.toLowerCase())) {
      const updated = [...savedReasons, { name: nameClean, iconName: 'custom' }];
      setSavedReasons(updated);
      setReason(nameClean); // Auto-select newly created reason
    }
    setNewReasonName('');
  };

  const handleRemoveCustomReason = (reasonToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting the tile during removal
    const updated = savedReasons.filter(r => r.name !== reasonToRemove);
    setSavedReasons(updated);
    if (reason === reasonToRemove) {
      setReason('Travelling');
    }
  };

  // Base preset reasons list
  const defaultPresets = [
    { value: 'Travelling', label: 'Transit / Travel', icon: MapPin, color: 'bg-azure text-forest' },
    { value: 'Rideshare', label: 'Rideshare / Taxi', icon: Car, color: 'bg-yellow-orange/20 text-forest border-yellow-orange/30' },
    { value: 'Night Out', label: 'Night Out / Social', icon: Glasses, color: 'bg-pink-accent/20 text-forest border-pink-accent/30' },
    { value: 'Date', label: 'Going on Date', icon: Sparkles, color: 'bg-pink-accent/30 text-forest border-pink-accent/50' },
    { value: 'Work Shift', label: 'Job / Work Shift', icon: Briefcase, color: 'bg-[#d1e5db] text-forest' }
  ];

  const intervals = [15, 30, 60, 90];

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date();
    const dueTime = new Date(now.getTime() + interval * 60000);

    // Dynamic mock GPS markers depending on user location privacy option selected
    let preciseCoords: string | undefined = undefined;
    let approxRegion: string | undefined = undefined;

    if (locationOption === 'precise') {
      preciseCoords = "-34.4250, 150.8931"; // Wollongong Crown St Exact
    } else if (locationOption === 'approximate') {
      approxRegion = "Within 400m of Crown Street Mall, Wollongong";
    }

    const session: SafetySession = {
      isActive: true,
      reason,
      intervalMinutes: interval,
      startedAt: now.toISOString(),
      checkInDueAt: dueTime.toISOString(),
      secondsRemaining: interval * 60,
      landmark: landmark.trim() || 'Crown Street, Wollongong',
      locationSharingOption: locationOption,
      preciseCoordinates: preciseCoords,
      approximateRegion: approxRegion,
      initialNote: initialNote.trim() || 'Starting a private update loop.',
      transportDetails: {
        plates: plates.trim().toUpperCase() || 'ABC123',
        model: model.trim() || 'Honda Civic (White)'
      }
    };

    onStartSession(session);
  };

  return (
    <div className="space-y-4 px-1 py-1" id="start-session-form-container">
      {/* Dynamic Header */}
      <div className="text-left space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] text-forest/70 font-mono tracking-wide uppercase">
          <Navigation className="w-3.5 h-3.5 animate-pulse text-yellow-orange fill-yellow-orange/20" />
          <span>LMK private update setup</span>
        </div>
        <h2 className="font-serif text-xl font-extrabold tracking-tight text-forest leading-tight">
          Where are you heading?
        </h2>
        <p className="text-[11px] text-forest/60">
          Set an optional snap nudge and choose what location context gets attached.
        </p>
      </div>

      {/* Demo Scenario Fast Access */}
      <div className="p-3.5 bg-[#e4f1fc] rounded-3xl border border-forest/15 flex items-start gap-3 text-left shadow-2sm bg-gradient-to-br from-[#e4f1fc] to-[#f2c0ca]/30">
        <span className="text-xl">🌟</span>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-forest uppercase tracking-wide">Prefill Wollongong Demo</h4>
          <p className="text-[10px] text-forest/80 leading-relaxed">
            Quickly preload a Crown Street rideshare context to demo private snap updates.
          </p>
          <button
            type="button"
            onClick={onLoadDemoPreset}
            className="mt-1.5 px-3 py-1 bg-forest text-white hover:bg-forest/90 text-[10px] font-semibold rounded-full flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
            id="btn-run-demo-preset"
          >
            <span>Load Travel Context</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleStart} className="space-y-4 text-left">
        {/* Reasons Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-forest uppercase tracking-wider">Select Transit Reason</label>
            <span className="text-[9px] text-forest/40 italic">Scroll left/right for saved</span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-2 px-0.5 no-scrollbar">
            {/* Presets */}
            {defaultPresets.map((item) => {
              const Icon = item.icon;
              const isSelected = reason === item.value;
              return (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setReason(item.value)}
                  className={`flex-none w-28 p-3 rounded-2xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-forest text-white border-forest ring-2 ring-forest/10 shadow-sm' 
                      : `${item.color} border-transparent hover:border-forest/20 shadow-2sm`
                  }`}
                  id={`reason-preset-tile-${item.value}`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-forest'}`} />
                  <span className="text-xs font-bold tracking-tight leading-tight block">{item.label}</span>
                </button>
              );
            })}

            {/* Custom Saved Reasons */}
            {savedReasons.map((customR) => {
              const isSelected = reason === customR.name;
              return (
                <div
                  key={customR.name}
                  onClick={() => setReason(customR.name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setReason(customR.name);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`flex-none w-28 p-3 rounded-2xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer relative focus:outline-none ${
                    isSelected 
                      ? 'bg-forest text-white border-forest ring-2 ring-forest/10 shadow-sm' 
                      : 'bg-cloud border-forest/10 text-forest hover:border-forest/20 shadow-2sm'
                  }`}
                  id={`reason-custom-tile-${customR.name}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Heart className={`w-3.5 h-3.5 ${isSelected ? 'text-pink-accent' : 'text-pink-accent/60'}`} />
                    <button
                      type="button"
                      onClick={(e) => handleRemoveCustomReason(customR.name, e)}
                      className={`text-[9px] hover:text-red-500 rounded p-0.5 ${isSelected ? 'text-white/60' : 'text-forest/40'}`}
                      title="Delete Saved Reason"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <span className="text-xs font-bold truncate tracking-tight leading-tight block w-full">{customR.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create and Save Custom Reason form block */}
        <div className="p-3 bg-white/70 backdrop-blur-xs rounded-2xl border border-forest/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-forest uppercase tracking-wider block">💾 Custom Saved Reasons Generator</span>
            <span className="text-[8px] bg-forest/5 font-mono text-forest px-1.5 py-0.2 rounded">Save unlimited shortcuts</span>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Hackathon, Uni day, Walking home..."
              value={newReasonName}
              onChange={(e) => setNewReasonName(e.target.value)}
              className="flex-1 p-2 bg-white border border-forest/10 rounded-xl text-xs text-forest focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCreateReason}
              className="px-3 bg-azure hover:bg-[#b0d8fa] text-forest rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors border border-forest/10"
              id="btn-save-custom-reason"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* GEOLOCATION SECURITY PARAMETERS (Configurable per session) */}
        <div className="space-y-1.5 p-3.5 bg-white rounded-3xl border border-forest/10" id="location-security-box">
          <div className="flex items-center justify-between border-b border-forest/5 pb-1.5">
            <label className="text-[10px] font-bold text-forest uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-forest/70" />
              <span>Location Security Settings</span>
            </label>
            <span className="text-[9px] bg-azure/50 font-mono text-forest px-1 rounded">Consent-First</span>
          </div>

          <p className="text-[10px] text-forest/60">
            Choose what level of location context is attached to your private snaps:
          </p>

          <div className="grid grid-cols-3 gap-2 pt-1 font-sans">
            {/* Precise location choice */}
            <button
              type="button"
              onClick={() => setLocationOption('precise')}
              className={`p-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                locationOption === 'precise'
                  ? 'bg-forest text-white border-forest shadow-sm'
                  : 'bg-cloud text-forest border-forest/10 hover:border-forest/25'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold leading-none block">Precise GPS</span>
              <span className="text-[7.5px] opacity-75 hidden xs:block">Real Lat/Lng</span>
            </button>

            {/* Approximate neighborhood choice */}
            <button
              type="button"
              onClick={() => setLocationOption('approximate')}
              className={`p-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                locationOption === 'approximate'
                  ? 'bg-forest text-white border-forest shadow-sm'
                  : 'bg-cloud text-forest border-forest/10 hover:border-forest/25'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[10px] font-bold leading-none block">Approximate</span>
              <span className="text-[7.5px] opacity-75 hidden xs:block">~400m Radius</span>
            </button>

            {/* Landmark text-only choice */}
            <button
              type="button"
              onClick={() => setLocationOption('landmark_only')}
              className={`p-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                locationOption === 'landmark_only'
                  ? 'bg-forest text-white border-forest shadow-sm'
                  : 'bg-cloud text-forest border-forest/10 hover:border-forest/25'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold leading-none block">Text-Only</span>
              <span className="text-[7.5px] opacity-75 hidden xs:block">No GPS Signal</span>
            </button>
          </div>

          <div className="p-2 bg-cloud/50 rounded-xl text-[9px] text-forest/70 font-mono">
            {locationOption === 'precise' && "🌐 Precise: exact GPS can be attached to updates you choose to post."}
            {locationOption === 'approximate' && "📍 Blue Ring: Circle sees Wollongong neighborhood center radius, but not your precise lane or building coordinates."}
            {locationOption === 'landmark_only' && "🏡 Text-Only: Zero background location checks. Trusted circle sees only your typed 'Departure Landmark' parameter."}
          </div>
        </div>

        {/* Interval Selector */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Snap nudge interval</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {intervals.map((duration) => {
              const isSelected = interval === duration;
              return (
                <button
                  type="button"
                  key={duration}
                  onClick={() => setInterval(duration)}
                  className={`py-2 px-1 rounded-xl text-center text-xs font-bold border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-forest text-white border-forest shadow-sm'
                      : 'bg-white border-forest/10 hover:border-forest/20 text-forest shadow-2sm'
                  }`}
                  id={`interval-btn-${duration}`}
                >
                  {duration}m
                </button>
              );
            })}
          </div>
        </div>

        {/* Landmark / Transport Fields */}
        <div className="p-3.5 bg-white rounded-3xl border border-forest/10 space-y-3">
          <div className="font-semibold text-xs text-forest/80 uppercase tracking-wider pb-1 border-b border-forest/5 flex items-center gap-1">
            <span>Additional Travel Details</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[9px] font-bold text-forest uppercase tracking-wider block mb-0.5">Vehicle Model</label>
              <input
                type="text"
                placeholder="e.g. Honda Civic, White Camry"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-2.5 py-2 bg-cloud/55 border border-forest/5 rounded-xl text-xs focus:outline-none text-forest placeholder:text-forest/30"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-forest uppercase tracking-wider block mb-0.5">License Plate</label>
              <input
                type="text"
                placeholder="e.g. ABC123"
                value={plates}
                onChange={(e) => setPlates(e.target.value)}
                className="w-full px-2.5 py-2 bg-cloud/55 border border-forest/5 rounded-xl text-xs focus:outline-none text-forest placeholder:text-forest/30"
              />
            </div>
          </div>

          <div>
            <label className="text-[9px] font-bold text-forest uppercase tracking-wider block mb-0.5">Departure Landmark</label>
            <input
              type="text"
              placeholder="e.g. Leaving Crown Street Cinema, Wollongong"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="w-full px-2.5 py-2 bg-cloud/55 border border-forest/5 rounded-xl text-xs focus:outline-none text-forest placeholder:text-forest/30"
            />
          </div>

          <div>
            <label className="text-[9px] font-bold text-forest uppercase tracking-wider block mb-0.5">Optional note for trusted circle</label>
            <input
              type="text"
              placeholder="e.g. Booking ride home. Let you know when I board."
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              className="w-full px-2.5 py-2 bg-cloud/55 border border-forest/5 rounded-xl text-xs focus:outline-none text-forest placeholder:text-forest/30"
            />
          </div>
        </div>

        {/* Start Master Button */}
        <button
          type="submit"
          className="w-full py-4 bg-forest text-white rounded-3xl font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer pt-3 pb-3 mt-1 bg-gradient-to-r from-forest to-[#1c5f35]"
          id="btn-active-session-start"
        >
          <span>Start Private Update Loop</span>
        </button>
      </form>
    </div>
  );
}
