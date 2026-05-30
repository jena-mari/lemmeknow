import React, { useEffect, useRef, useState } from 'react';
import { CheckIn, LocationSharingOption } from '../types';
import { generateGeminiCaption, localActivitySuggestions } from '../services/gemini';
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  MapPin,
  RefreshCw,
  Wand2,
} from 'lucide-react';

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
  initialLandmark = '',
  initialPlates = '',
  initialModel = '',
  locationSharingOption = 'approximate',
  preciseCoordinates,
  approximateRegion,
  username = '@jamie',
}: CheckInFormProps) {
  const [page, setPage] = useState<'camera' | 'compose'>('camera');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [landmark, setLandmark] = useState(initialLandmark);
  const [note, setNote] = useState('');
  const [plates, setPlates] = useState(initialPlates);
  const [model, setModel] = useState(initialModel);
  const [activity, setActivity] = useState(initialModel || 'hackathon');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraMessage, setCameraMessage] = useState('Camera ready');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [livePreciseCoordinates, setLivePreciseCoordinates] = useState(preciseCoordinates);
  const [liveApproximateRegion, setLiveApproximateRegion] = useState(approximateRegion);
  const [locationStatus, setLocationStatus] = useState('location tag');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const captionIdeas = localActivitySuggestions().slice(0, 4);
  const activityTags = ['date', 'uni', 'going out', 'hackathon', 'commute'];

  useEffect(() => {
    let stream: MediaStream | null = null;
    let disposed = false;

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraMessage('Camera unavailable');
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
          setCameraMessage('Camera ready');
        }
      } catch {
        setCameraMessage('Camera permission needed');
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
      setLocationStatus('place tag');
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus('place tag');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
        setLivePreciseCoordinates(coords);
        setLiveApproximateRegion(`near ${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)}`);
        setLocationStatus('nearby');
      },
      () => setLocationStatus('place tag'),
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 5000 }
    );
  }, [locationSharingOption]);

  const handleSnap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!isCameraReady || !video || !canvas || video.videoWidth <= 0) {
      setCameraMessage('Camera permission needed');
      return;
    }

    setIsCapturing(true);
    window.setTimeout(() => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      setPhotoUrl(canvas.toDataURL('image/jpeg', 0.92));
      setIsCapturing(false);
      setPage('compose');
    }, 600);
  };

  const handleGeminiSuggestion = async () => {
    setIsSuggesting(true);
    const suggestion = await generateGeminiCaption({
      username,
      note,
      landmark,
      activity,
    });
    setNote(suggestion.replace(/^["']|["']$/g, ''));
    setIsSuggesting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPostCheckIn({
      photoUrl,
      landmark: landmark.trim() || activity,
      note: note.trim() || 'quick little update',
      locationSharingOption,
      preciseCoordinates: locationSharingOption === 'precise' ? livePreciseCoordinates : undefined,
      approximateRegion: locationSharingOption === 'approximate' ? liveApproximateRegion : undefined,
      transportDetails: plates.trim() || model.trim() ? {
        plates: plates.trim().toUpperCase(),
        model: model.trim() || activity,
      } : undefined,
    });
  };

  if (page === 'camera') {
    return (
      <div className="lmk-page -mx-4 -my-4 flex min-h-full flex-col items-center px-4 py-5 text-brand-black" id="camera-page">
        <section className="lmk-shell relative z-10 flex flex-1 overflow-hidden rounded-[38px] bg-brand-black shadow-[0_20px_46px_rgba(18,66,36,0.16)]">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`absolute inset-0 h-full w-full object-cover ${isCameraReady ? 'block' : 'hidden'}`}
          />
          <canvas ref={canvasRef} className="hidden" />

          {!isCameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#cce6fc] px-8 text-center">
              <div className="mb-5 flex h-16 w-20 items-center justify-center rounded-full bg-yellow-orange text-brand-black shadow-sm">
                <Camera className="h-7 w-7" />
              </div>
              <p className="text-[28px] font-black text-brand-black">Camera only</p>
              <p className="mt-3 max-w-[220px] text-sm font-medium text-brand-black">
                LMK only posts photos taken right now.
              </p>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white">
            <span className="rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-black backdrop-blur">
              close circle
            </span>
            <span className="rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-black text-brand-black">
              {cameraMessage}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="mb-5 flex justify-center">
              <button
                type="button"
                onClick={handleSnap}
                disabled={!isCameraReady}
                className="flex h-22 w-22 items-center justify-center rounded-full border-[7px] border-white bg-yellow-orange text-brand-black shadow-lg disabled:bg-white/55 disabled:text-brand-black/60"
                aria-label="Snap photo"
              >
                <Camera className="h-8 w-8" />
              </button>
            </div>
          </div>

          {isCapturing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90">
              <RefreshCw className="mb-2 h-8 w-8 animate-spin text-forest" />
              <span className="text-xs font-black text-forest">snapping...</span>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="lmk-page -mx-4 -my-4 min-h-full px-4 py-5 text-left text-brand-black" id="composer-page">
      <div className="lmk-shell">
      <button
        type="button"
        onClick={() => setPage('camera')}
        className="relative z-10 mb-3 rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-black text-brand-black shadow-sm"
      >
        retake
      </button>

      <section className="relative z-10 overflow-hidden rounded-[34px] bg-brand-black shadow-[0_18px_42px_rgba(18,66,36,0.14)]">
        <div className="relative aspect-[4/5]">
          <img src={photoUrl} alt="Snapped update" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-4 text-white">
            <span className="text-xs font-black">Only your circle</span>
          </div>
        </div>
      </section>

      <section className="lmk-panel relative z-10 mt-4 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-brand-black">Add a caption</h2>
          <button
            type="button"
            onClick={handleGeminiSuggestion}
            disabled={isSuggesting}
            className="flex items-center gap-1 rounded-full bg-[#cce6fc] px-3 py-1.5 text-[10px] font-black text-brand-black disabled:opacity-60"
          >
            <Wand2 className="h-3.5 w-3.5 text-forest" />
            <span>{isSuggesting ? 'thinking' : 'Gemini'}</span>
          </button>
        </div>

        <textarea
          placeholder="at hackathon rn lol"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="h-16 w-full resize-none rounded-[24px] border border-white/80 bg-white/82 p-3 text-sm font-bold text-brand-black placeholder:text-brand-black/60 shadow-inner focus:outline-none"
        />

        <div className="mt-2 flex gap-1.5 overflow-x-auto no-scrollbar">
          {captionIdeas.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => setNote(suggestion)}
              className="shrink-0 rounded-full border border-white/80 bg-white/82 px-3 py-1.5 text-[10px] font-bold text-brand-black/70"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-black/65" />
            <input
              type="text"
              placeholder={locationStatus}
              value={landmark}
              onChange={(event) => setLandmark(event.target.value)}
              className="w-full rounded-full border border-white/80 bg-white/82 py-3 pl-9 pr-3 text-xs font-bold text-brand-black placeholder:text-brand-black/60 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setDetailsOpen((open) => !open)}
            className="flex items-center gap-1 rounded-full bg-light-green/80 px-3 py-2 text-[10px] font-black text-forest"
          >
            <span>more</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {detailsOpen && (
          <div className="mt-3 space-y-3 rounded-[24px] bg-[#cce6fc]/45 p-3">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              {activityTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setActivity(tag);
                    if (!model) setModel(tag);
                  }}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black ${
                    activity === tag ? 'bg-brand-black text-white' : 'bg-white text-brand-black/60'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="quick note"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                className="rounded-[18px] border border-white/80 bg-white px-3 py-3 text-xs font-bold text-brand-black placeholder:text-brand-black/60 focus:outline-none"
              />
              <input
                type="text"
                placeholder="ride / transit"
                value={plates}
                onChange={(event) => setPlates(event.target.value)}
                className="rounded-[18px] border border-white/80 bg-white px-3 py-3 text-xs font-bold text-brand-black placeholder:text-brand-black/60 focus:outline-none"
              />
            </div>
          </div>
        )}
      </section>

      <button
        type="submit"
        className="lmk-primary relative z-10 mt-4 flex h-[62px] w-full items-center justify-center gap-1.5 bg-yellow-orange px-4 text-[18px] font-medium text-black"
        id="sub-post-checkin"
      >
        <CheckCircle2 className="h-4 w-4 text-black" />
        <span>Post to circle</span>
      </button>
      </div>
    </form>
  );
}
