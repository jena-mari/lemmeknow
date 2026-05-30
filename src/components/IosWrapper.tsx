import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal, ScreenShare, Sparkles } from 'lucide-react';

interface IosWrapperProps {
  children: React.ReactNode;
}

export default function IosWrapper({ children }: IosWrapperProps) {
  const [currentTime, setCurrentTime] = useState('10:14');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Keep internal clock running
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      // Format as 12-hour or 24-hour. Standard 12 hour
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    
    updateClock();
    const interval = setInterval(updateClock, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  if (isFullscreen) {
    return (
      <div className="w-full min-h-screen bg-cloud text-forest font-sans">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-forest/5 flex flex-col items-center justify-center py-6 px-4 select-none">
      {/* Outer Browser Header / Showcase controls */}
      <div className="w-full max-w-sm mb-3 flex items-center justify-between text-xs text-forest/70 font-sans tracking-wide">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-orange fill-yellow-orange/20 animate-pulse" />
          <span className="font-semibold text-forest">LEMMEKNOW (LMK) iOS MVP</span>
        </div>
        <button
          onClick={() => setIsFullscreen(true)}
          className="flex items-center gap-1 hover:text-forest transition-colors bg-white/70 hover:bg-white px-2 py-1 rounded-full border border-forest/10 cursor-pointer"
        >
          <ScreenShare className="w-3 h-3" />
          <span>Full Preview</span>
        </button>
      </div>

      {/* Main iPhone Frame */}
      <div className="relative w-full max-w-[393px] h-[852px] rounded-[52px] border-[12px] border-forest bg-cloud shadow-2xl overflow-hidden flex flex-col">
        {/* Dynamic Island / Speaker Line */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[110px] h-7 bg-black rounded-full z-50 flex items-center justify-between px-3.5">
          {/* LMK Indicator Dot inside island */}
          <div className="w-2.5 h-2.5 bg-yellow-orange rounded-full animate-ping" />
          <div className="w-4 h-1 bg-neutral-800 rounded-full" />
          <div className="w-2.5 h-2.5 bg-azure rounded-full" />
        </div>

        {/* Status Bar */}
        <div className="h-13 pt-4 px-8 flex items-center justify-between text-xs font-semibold text-forest select-none z-40 bg-transparent shrink-0">
          <span className="text-[11px] tracking-tight">{currentTime}</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5" />
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-0.5">
              <span className="text-[9px] mr-0.5">94%</span>
              <Battery className="w-4 h-4 text-forest" />
            </div>
          </div>
        </div>

        {/* Screen Scrollable View */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col bg-cloud">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="h-6 pb-2 flex items-center justify-center bg-transparent shrink-0">
          <div className="w-32 h-1.5 bg-forest rounded-full opacity-60" />
        </div>
      </div>

      {/* Quick note for deployment helper */}
      <div className="mt-4 text-[10px] text-forest/40 text-center max-w-xs font-mono">
        Anti-Surveillance Consent Framework • LMK Target Build iOS v18.0
      </div>
    </div>
  );
}
