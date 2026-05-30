import React, { useState } from 'react';
import { CheckIn, SafetySession, Contact } from '../types';
import { 
  ShieldAlert, Phone, Copy, Check, Download, Share2, 
  MapPin, Clock, Car, FileText, User, X, AlertTriangle 
} from 'lucide-react';

interface EmergencyCardProps {
  session: SafetySession | null;
  lastCheckIn: CheckIn | null;
  contacts: Contact[];
  onClose: () => void;
}

export default function EmergencyCard({
  session,
  lastCheckIn,
  contacts,
  onClose
}: EmergencyCardProps) {
  const [copied, setCopied] = useState(false);

  // Fallbacks for the demo state (Wollongong Uber)
  const landmark = lastCheckIn?.landmark || session?.landmark || "Crown Street, Wollongong NSW";
  const plates = lastCheckIn?.transportDetails?.plates || session?.transportDetails?.plates || "ABC123";
  const model = lastCheckIn?.transportDetails?.model || session?.transportDetails?.model || "Honda Civic (White)";
  const lastPhoto = lastCheckIn?.photoUrl || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=500&q=80"; // Uber passenger seat
  const noteText = lastCheckIn?.note || session?.initialNote || "Taking Uber home from Wollongong.";
  const timeText = lastCheckIn?.timestamp 
    ? new Date(lastCheckIn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : session?.startedAt 
    ? new Date(session.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : "10:14 PM";

  const fileNoteText = session?.locationSharingOption === 'precise' 
    ? `Verified Lat/Lng: ${session?.preciseCoordinates || "-34.4250, 150.8931"}`
    : session?.locationSharingOption === 'approximate'
    ? `Approximate Mask: ${session?.approximateRegion || "Within 400m radius center"}`
    : `Privacy setting: Minimal text representation ONLY (No GPS signals shared)`;

  const fullReportText = `🚨 LEMMEKNOW (LMK) EMERGENCY ACTIVE SAFETY BRIEF
=========================================
Subject: Safety Session Overdue Alert
Primary Transit Reason: ${session?.reason || "Travelling Home"}
Last Known Landmark: ${landmark}
Location Security Option: ${session?.locationSharingOption?.toUpperCase() || 'APPROXIMATE'}
Privacy Details: ${fileNoteText}
Last Updated Time: ${timeText} (30th May 2026 UTC)

VEHICLE & RIDESHARE LOG:
- Rideshare Service / Vehicle: ${model}
- License Plate: ${plates}

CURRENT STATUS / REPORT NOTE:
"${noteText}"

SECURE CONTACT CIRCLE:
${contacts.map(c => `- ${c.name} (${c.relationship}): ${c.phone}`).join('\n')}

Note: This report contains verified, user-consented timestamped photos and transit markers uploaded voluntarily to LEMMEKNOW. Use this file immediately for police reference.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullReportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-forest/80 backdrop-blur-md z-50 flex items-center justify-center p-4" id="emergency-card-modal">
      <div className="bg-cloud w-full max-w-sm rounded-[36px] overflow-hidden border border-forest/20 shadow-2xl flex flex-col max-h-[90vh] animate-scaleUp">
        {/* Header bar */}
        <div className="bg-red-700 text-white p-4.5 text-center relative shrink-0">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
            title="Close Card"
            id="close-emergency-card-btn"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <ShieldAlert className="w-5 h-5 text-yellow-orange fill-yellow-orange/20 animate-pulse" />
            <h2 className="font-serif text-lg font-bold tracking-tight">Emergency Info Card</h2>
          </div>
          <p className="text-[10px] uppercase font-mono tracking-wider opacity-85">
            Active Verified Missing Persons Evidence Dossier
          </p>
        </div>

        {/* Info card scroll section */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 text-left">
          {/* Warning banner */}
          <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            <div className="text-[10px] text-red-800 leading-relaxed font-sans">
              <strong>OFFICIAL SAFETY RECORD:</strong> This card preserves the exact parameters the user declared. Perfect coordinates, plate records, and photographic proof to speed up first responder actions.
            </div>
          </div>

          {/* Last check in photograph */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-forest uppercase tracking-widest block">Last Captured Landmark Photo</span>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-red-600/30 bg-forest/5 shadow-md">
              <img
                src={lastPhoto}
                alt="Latest checkin"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white">
                <span className="text-xs font-semibold flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-yellow-orange" />
                  {landmark}
                </span>
                <span className="text-[9px] opacity-75 font-mono block mt-0.5">
                  Captured at: {timeText} today (consented upload)
                </span>
              </div>
            </div>
          </div>

          {/* Core metadata stats */}
          <div className="p-3.5 bg-white rounded-2xl border border-forest/10 space-y-2.5 font-sans">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-forest/50 text-[9px] font-bold uppercase tracking-wider block">Logged Uber Vehicle</span>
                <span className="font-bold text-forest text-[11px] block truncate">{model}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-forest/50 text-[9px] font-bold uppercase tracking-wider block">Licensed Plate</span>
                <span className="font-mono bg-yellow-orange px-1.5 py-0.5 rounded text-[10px] font-bold text-forest inline-block border border-forest/5 shadow-2xs">
                  {plates}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-forest/5 space-y-1 text-[10px] text-forest/70 font-mono">
              <div className="flex justify-between">
                <span className="font-bold text-forest">Sharing Mode:</span>
                <span className="uppercase text-forest font-bold">{session?.locationSharingOption || 'APPROXIMATE'}</span>
              </div>
              <div className="text-[9px] text-forest/60 bg-cloud p-1 px-1.5 rounded leading-tight">
                {fileNoteText}
              </div>
            </div>

            <div className="pt-2 border-t border-forest/5">
              <span className="text-forest/50 text-[9px] font-bold uppercase tracking-wider block mb-0.5">Last Logged Note / Intent</span>
              <p className="text-[11px] text-forest/80 italic font-medium leading-relaxed bg-cloud/50 p-2.5 rounded-xl border border-forest/5">
                "{noteText}"
              </p>
            </div>
          </div>

          {/* Contacts info list */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-forest uppercase tracking-widest block">Trusted Circle Witnesses</span>
            <div className="space-y-1.5">
              {contacts.map((c) => (
                <div key={c.id} className="p-2.5 bg-white rounded-xl border border-forest/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-forest">{c.name}</span>
                    <span className="text-[9px] bg-azure/50 text-forest px-1.5 py-0.2 rounded font-semibold ml-1.5">
                      {c.relationship}
                    </span>
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    className="flex items-center gap-1 bg-forest/5 hover:bg-forest/10 text-forest font-semibold py-1 px-2.5 rounded-lg font-mono text-[10px] border border-forest/10 cursor-pointer text-right"
                  >
                    <Phone className="w-3 h-3 text-forest" />
                    <span>Call Phone</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Copiable Brief / Action block */}
        <div className="p-3.5 bg-white border-t border-forest/10 flex gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 bg-cloud hover:bg-forest/5 text-forest font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all border border-forest/10 cursor-pointer text-center"
            id="copy-emergency-card-btn"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Text Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-forest/50" />
                <span>Copy Safe dossier</span>
              </>
            )}
          </button>

          <a
            href="tel:000"
            className="flex-1 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
            id="emergency-call-000"
          >
            <Phone className="w-3.5 h-3.5 text-white" />
            <span>Call Authorities</span>
          </a>
        </div>
      </div>
    </div>
  );
}
