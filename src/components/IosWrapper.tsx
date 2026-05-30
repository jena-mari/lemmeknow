import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

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
      <div className="w-full min-h-screen bg-white text-brand-black font-sans">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8f3] flex flex-col items-center justify-center py-6 px-4 select-none">
      <div className="relative w-full max-w-[393px] h-[852px] rounded-[52px] border-[12px] border-white/75 bg-white shadow-2xl overflow-hidden flex flex-col">
        {/* Dynamic Island / Speaker Line */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[110px] h-7 bg-brand-black rounded-full z-50 flex items-center justify-between px-3.5">
          {/* LMK Indicator Dot inside island */}
          <div className="w-2.5 h-2.5 bg-light-green rounded-full animate-ping" />
          <div className="w-4 h-1 bg-neutral-800 rounded-full" />
          <div className="w-2.5 h-2.5 bg-yellow-orange rounded-full" />
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
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col bg-white">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="h-6 pb-2 flex items-center justify-center bg-white shrink-0">
          <div className="w-32 h-1.5 bg-forest rounded-full opacity-60" />
        </div>
      </div>

    </div>
  );
}
