import React, { useEffect, useRef, useState } from 'react';
import { CheckIn, LocationSharingOption } from '../types';
import { CALMING_MOCK_PHOTOS } from '../data/mockData';
import { generateGeminiCaption, localActivitySuggestions } from '../services/gemini';
import { Camera, Image as ImageIcon, MapPin, CheckCircle2, Shield, EyeOff, Globe, Sparkles, RefreshCw } from 'lucide-react';

interface CheckInFormProps {
  onPostCheckIn: (checkIn: Omit<CheckIn, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
  initialLandmark?: string;
  initialPlates?: string;
  initialModel?: string;
  locationSharingOption?: LocationSharingOption;
  preciseCoordinates?: string;
  approximateRegion?: string;
  username?: string;
}

export default function CheckInForm({
  onPostCheckIn,
  onCancel,
  initialLandmark = '',
  initialPlates = '',
  initialModel = '',
  locationSharingOption = 'approximate',
  preciseCoordinates,
  approximateRegion,
  username = '@jamie'
}: CheckInFormProps) {
  const [photoUrl, setPhotoUrl] = useState<string>(CALMING_MOCK_PHOTOS[0].url); // Default to Uber Seat
  const [landmark, setLandmark] = useState(initialLandmark);
  const [note, setNote] = useState('at hackathon rn lol');
  const [plates, setPlates] = useState(initialPlates);
  const [model, setModel] = useState(initialModel);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraMessage, setCameraMessage] = useState('Camera fallback loaded');
  const [livePreciseCoordinates, setLivePreciseCoordinates] = useState(preciseCoordinates);
  const [liveApproximateRegion, setLiveApproximateRegion] = useState(approximateRegion);
  const [locationStatus, setLocationStatus] = useState('Location will attach when allowed');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let disposed = false;

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraMessage('Browser camera unavailable, using mock snap');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (disposed) return;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsCameraReady(true);
          setCameraMessage('Live camera ready');
        }
      } catch {
        setCameraMessage('Camera permission skipped, using mock snap');
      }
    };

    startCamera();

    return () => {
      disposed = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (locationSharingOption === 'landmark_only') {
      setLocationStatus('Location hidden for this update');
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus('Location fallback: Crown Street area');
      return;
    }

    setLocationStatus('Updating location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
        setLivePreciseCoordinates(coords);
        setLiveApproximateRegion(`Near ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`);
        if (!landmark.trim()) setLandmark('Live location auto-updated');
        setLocationStatus('Location attached to this private update');
      },
      () => setLocationStatus('Location permission skipped, using typed place'),
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 5000 }
    );
  }, [locationSharingOption]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPreset = (url: string) => {
    setPhotoUrl(url);
  };

  const handleSnap = () => {
    setIsCapturing(true);
    window.setTimeout(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (isCameraReady && video && canvas && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(video, 0, 0, canvas.width, canvas.height);
        setPhotoUrl(canvas.toDataURL('image/jpeg', 0.92));
      } else {
        const randomPhoto = CALMING_MOCK_PHOTOS[Math.floor(Math.random() * CALMING_MOCK_PHOTOS.length)].url;
        setPhotoUrl(randomPhoto);
      }

      setIsCapturing(false);
    }, 850);
  };

  const handleGeminiSuggestion = async () => {
    setIsSuggesting(true);
    const suggestion = await generateGeminiCaption({
      username,
      note,
      landmark,
      activity: model || plates ? 'rideshare' : 'casual update',
    });
    setNote(suggestion);
    setIsSuggesting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPostCheckIn({
      photoUrl,
      landmark: landmark.trim() || 'Crown Street, Wollongong',
      note: note.trim() || 'quick private update',
      locationSharingOption,
      preciseCoordinates: locationSharingOption === 'precise' ? (livePreciseCoordinates || "-34.4250, 150.8931") : undefined,
      approximateRegion: locationSharingOption === 'approximate' ? (liveApproximateRegion || "Near Crown Street Mall, Wollongong") : undefined,
      transportDetails: plates || model ? {
        plates: plates.trim().toUpperCase(),
        model: model.trim()
      } : undefined
    });
  };

  return (
    <div className="space-y-4 px-1" id="checkin-form">
      {/* Header */}
      <div className="text-left">
        <h3 className="font-serif text-xl font-extrabold text-forest">Private Snap</h3>
        <p className="text-xs text-forest/70">
          Snap what you are doing, add a tiny note, and post it only to your circle.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Photo Capture Box */}
        <div className="space-y-2">
          {/* Active Geolocation Accuracy Badge */}
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-forest uppercase tracking-wider block">Camera</label>
            <div className="flex items-center gap-1 bg-azure px-2 py-0.5 rounded-full text-[9px] font-mono text-forest font-bold">
              <Shield className="w-2.5 h-2.5" />
              <span>{locationStatus}</span>
            </div>
          </div>
          
          <div className="relative aspect-[4/3] rounded-3xl bg-forest/5 overflow-hidden border border-forest/10 shadow-inner flex flex-col items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`absolute inset-0 w-full h-full object-cover ${isCameraReady ? 'block' : 'hidden'}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {!isCameraReady && photoUrl ? (
              <>
                <img
                  src={photoUrl}
                  alt="Private update context"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  id="preview-checkin-img"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3.5 flex flex-col gap-1 text-white">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-yellow-orange" />
                    <span>{landmark || 'No landmark specified'}</span>
                  </div>
                  
                  {/* Real-time description of shared data */}
                  <div className="flex items-center gap-1 text-[8.5px] text-white/80 font-mono">
                    {locationSharingOption === 'precise' && (
                      <span className="flex items-center gap-1 text-[#afffcc]">
                        <Globe className="w-2.5 h-2.5" /> Precise lat/lng attached: -34.4250, 150.8931
                      </span>
                    )}
                    {locationSharingOption === 'approximate' && (
                      <span className="flex items-center gap-1 text-yellow-orange">
                        <MapPin className="w-2.5 h-2.5" /> Masked: Within 400m of Crown Street, Wollongong
                      </span>
                    )}
                    {locationSharingOption === 'landmark_only' && (
                      <span className="flex items-center gap-1 text-red-300">
                        <EyeOff className="w-2.5 h-2.5" /> Geodata Hidden. Text landmark descriptor only!
                      </span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              !isCameraReady && <div className="text-center p-4">
                <Camera className="w-8 h-8 text-forest/40 mx-auto mb-1 animate-pulse" />
                <span className="text-xs text-forest/50 font-medium">{cameraMessage}</span>
              </div>
            )}

            {isCameraReady && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3.5 flex flex-col gap-1 text-white">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-yellow-orange" />
                  <span>{landmark || 'Live camera'}</span>
                </div>
                <div className="text-[8.5px] text-white/80 font-mono">{cameraMessage}</div>
              </div>
            )}

            {isCapturing && (
              <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center transition-all">
                <RefreshCw className="w-8 h-8 text-forest animate-spin mb-2" />
                <span className="text-xs font-semibold text-forest">Snapping private update...</span>
              </div>
            )}
          </div>

          {/* Quick Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSnap}
              className="flex-1 py-2 bg-forest text-white hover:bg-forest/90 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-3xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{isCameraReady ? 'Snap Photo' : 'Use Mock Snap'}</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-3 bg-azure/55 hover:bg-azure text-forest rounded-2xl text-xs font-semibold transition-all flex items-center justify-center gap-1 border border-forest/10 cursor-pointer shadow-3xs"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Attach File</span>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Calming presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[9px] font-bold text-forest/60 uppercase block">Fallback presets:</span>
            <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
              {CALMING_MOCK_PHOTOS.map((pic, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectPreset(pic.url)}
                  className={`flex-none w-20 rounded-xl overflow-hidden border-2 transition-all relative cursor-pointer ${
                    photoUrl === pic.url ? 'border-forest scale-95 shadow-sm' : 'border-transparent scale-100'
                  }`}
                  id={`preset-img-btn-${idx}`}
                >
                  <img src={pic.url} alt={pic.name} className="w-full h-12 object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/10 hover:bg-transparent" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[7px] truncate px-0.5 text-center">
                    {pic.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Note, landmark, vehicle details */}
        <div className="space-y-3 p-3.5 bg-white rounded-3xl border border-forest/10">
          <div>
            <label className="text-[9px] font-bold text-forest uppercase tracking-wider block mb-0.5">Current place</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/40" />
              <input
                type="text"
              placeholder="e.g. Hackathon table, uni, train stop"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-cloud/50 border border-forest/5 rounded-xl text-xs focus:outline-none text-forest placeholder:text-forest/30"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[9px] font-bold text-forest uppercase tracking-wider block">Tiny caption</label>
              <button
                type="button"
                onClick={handleGeminiSuggestion}
                disabled={isSuggesting}
                className="text-[9px] bg-azure hover:bg-[#b0d8fa] text-forest px-2 py-0.5 rounded-full font-bold flex items-center gap-1 disabled:opacity-60"
              >
                <Sparkles className="w-3 h-3 text-yellow-orange" />
                <span>{isSuggesting ? 'Gemini...' : 'Gemini suggest'}</span>
              </button>
            </div>
            <textarea
              placeholder="e.g. at hackathon rn lol"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 bg-cloud/50 border border-forest/5 rounded-xl text-xs focus:outline-none h-14 text-forest resize-none placeholder:text-forest/30"
            />
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {localActivitySuggestions().map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setNote(suggestion)}
                  className="shrink-0 text-[9px] bg-white border border-forest/10 text-forest/75 rounded-full px-2 py-1 hover:border-forest/25"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-bold text-forest uppercase tracking-wider block mb-0.5">Optional context</label>
              <input
                type="text"
                placeholder="e.g. Hackathon, uni, Uber"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-2 py-1.5 bg-cloud/50 border border-forest/5 rounded-xl text-xs focus:outline-none text-forest"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold text-forest uppercase tracking-wider block mb-0.5">Plate / detail</label>
              <input
                type="text"
                placeholder="e.g. ABC123"
                value={plates}
                onChange={(e) => setPlates(e.target.value)}
                className="w-full px-2 py-1.5 bg-cloud/50 border border-forest/5 rounded-xl text-xs focus:outline-none text-forest"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-cloud hover:bg-forest/5 text-forest rounded-2xl text-[11px] font-bold transition-all border border-forest/10 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-2 py-3 bg-forest hover:bg-forest/95 text-white rounded-2xl text-[11px] font-bold shadow-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
            id="sub-post-checkin"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-yellow-orange fill-yellow-orange/10" />
            <span>Post Private Update</span>
          </button>
        </div>
      </form>
    </div>
  );
}
