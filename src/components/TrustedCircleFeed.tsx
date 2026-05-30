import React, { useEffect, useMemo, useState } from 'react';
import { AttachedLocation, CheckIn, Contact, MockUpdate } from '../types';
import { MOCK_FRIENDS_UPDATES } from '../data/mockData';
import InstantsGrid from './InstantsGrid';
import {
  CalendarDays,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock3,
  EyeOff,
  Heart,
  Lock,
  MapPin,
  MessageCircle,
  Route,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from 'lucide-react';

interface TrustedCircleFeedProps {
  userCheckIns: CheckIn[];
  contacts?: Contact[];
  friendsUpdates?: MockUpdate[];
  onOpenCamera: () => void;
  onDeleteUpdate: (id: string) => void;
  onUpdatePrivacy: (id: string, changes: { hideLocation?: boolean; visibility?: 'circle' | 'only_me' }) => void;
}

type CircleUpdate = {
  id: string;
  name: string;
  initials: string;
  color: string;
  time: string;
  exactTime: string;
  photoUrl: string;
  note: string;
  landmark: string;
  attachedLocation?: AttachedLocation;
  hideLocation?: boolean;
  visibility?: 'circle' | 'only_me';
  extractedContext?: {
    activity?: string;
    destination?: string;
    vehiclePlate?: string;
    transitMode?: string;
    people?: string[];
    cleanedNote?: string;
  };
  tag?: string;
  detail?: string;
  mine?: boolean;
  timestamp?: string;
  dayKey?: string;
};

type FriendRecap = {
  name: string;
  initials: string;
  color: string;
  updateCount: number;
  places: string[];
  notes: string[];
  exactTimes: string[];
  latestTime: string;
  days: FriendRecapDay[];
};

type FriendRecapDay = {
  key: string;
  label: string;
  entries: FriendRecapEntry[];
};

type FriendRecapEntry = {
  note: string;
  place: string;
  exactTime: string;
  relativeTime: string;
  context?: string;
};

type AiTimelineItem = {
  time: string;
  note: string;
  place: string;
  context?: string;
};

export default function TrustedCircleFeed({
  userCheckIns,
  contacts = [],
  friendsUpdates = MOCK_FRIENDS_UPDATES,
  onOpenCamera,
  onDeleteUpdate,
  onUpdatePrivacy,
}: TrustedCircleFeedProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeRecapIndex, setActiveRecapIndex] = useState(0);
  const [activeRecapDayIndex, setActiveRecapDayIndex] = useState(0);

  const updates = useMemo<CircleUpdate[]>(() => {
    const mine = userCheckIns.map((update) => ({
      id: update.id,
      name: 'You',
      initials: 'ME',
      color: 'bg-yellow-orange text-brand-black',
      time: formatTimeAgo(update.timestamp),
      exactTime: formatDateTime(update.timestamp),
      photoUrl: update.photoUrl,
      note: update.note,
      landmark: update.landmark,
      attachedLocation: update.attachedLocation,
      hideLocation: update.hideLocation,
      visibility: update.visibility || 'circle',
      extractedContext: update.extractedContext,
      tag: update.transportDetails?.model,
      detail: update.transportDetails?.plates,
      mine: true,
      timestamp: update.timestamp,
      dayKey: getDayKey(update.timestamp),
    }));

    const friends = friendsUpdates.map((friend) => ({
      id: friend.id,
      name: friend.friendName.split(' ')[0],
      initials: friend.friendInitials,
      color: friend.friendColor,
      time: friend.timeAgo,
      exactTime: friend.timestamp ? formatDateTime(friend.timestamp) : friend.timeAgo,
      photoUrl: friend.photoUrl,
      note: friend.note,
      landmark: friend.landmark,
      attachedLocation: friend.attachedLocation,
      hideLocation: friend.hideLocation,
      visibility: friend.visibility || 'circle',
      extractedContext: friend.extractedContext,
      tag: friend.reason,
      detail: friend.transportText,
      mine: false,
      timestamp: friend.timestamp,
      dayKey: friend.timestamp ? getDayKey(friend.timestamp) : undefined,
    }));

    return [...mine, ...friends];
  }, [friendsUpdates, userCheckIns]);

  const myUpdates = useMemo(
    () => updates.filter((update) => update.mine && update.timestamp),
    [updates]
  );
  const todayKey = getDayKey(new Date().toISOString());
  const todayUpdates = myUpdates.filter((update) => update.dayKey === todayKey);
  const archiveDays = useMemo(() => buildArchiveDays(myUpdates), [myUpdates]);
  const friendRecaps = useMemo(() => buildFriendRecaps(friendsUpdates), [friendsUpdates]);
  const activeRecap = friendRecaps[Math.min(activeRecapIndex, friendRecaps.length - 1)];
  const activeRecapDay = activeRecap?.days[Math.min(activeRecapDayIndex, activeRecap.days.length - 1)];
  const active = updates[Math.min(activeIndex, updates.length - 1)];
  const circleVisibleUpdates = myUpdates.filter((update) => update.visibility !== 'only_me');
  const latestCircleVisible = circleVisibleUpdates[0];
  const aiTimeline = useMemo(() => buildAiTimeline(todayUpdates.length ? todayUpdates : myUpdates.slice(0, 4)), [myUpdates, todayUpdates]);

  useEffect(() => {
    if (activeIndex > 0 && activeIndex >= updates.length) {
      setActiveIndex(updates.length - 1);
    }
  }, [activeIndex, updates.length]);

  useEffect(() => {
    if (activeRecapIndex > 0 && activeRecapIndex >= friendRecaps.length) {
      setActiveRecapIndex(friendRecaps.length - 1);
    }
  }, [activeRecapIndex, friendRecaps.length]);

  useEffect(() => {
    setActiveRecapDayIndex(0);
  }, [activeRecapIndex]);

  useEffect(() => {
    if (activeRecap && activeRecapDayIndex > 0 && activeRecapDayIndex >= activeRecap.days.length) {
      setActiveRecapDayIndex(activeRecap.days.length - 1);
    }
  }, [activeRecap, activeRecapDayIndex]);

  const move = (direction: 1 | -1) => {
    setActiveIndex((current) => {
      const next = current + direction;
      if (next < 0) return updates.length - 1;
      if (next >= updates.length) return 0;
      return next;
    });
  };

  const openDay = (dayKey: string) => {
    const index = updates.findIndex((update) => update.mine && update.dayKey === dayKey);
    if (index >= 0) setActiveIndex(index);
  };

  const deleteActive = () => {
    if (!active?.mine) return;
    onDeleteUpdate(active.id);
    setActiveIndex((current) => Math.max(0, current - 1));
  };

  if (!active) {
    return (
      <div className="lmk-page -mx-4 -my-4 flex min-h-full flex-col justify-center px-6 text-center">
        <div className="relative z-10 mx-auto mb-5 flex h-16 w-20 items-center justify-center rounded-full bg-yellow-orange text-brand-black shadow-sm">
          <Camera className="h-7 w-7" />
        </div>
        <h2 className="relative z-10 text-[34px] font-black text-brand-black">No updates yet</h2>
        <p className="relative z-10 mt-3 text-[15px] font-medium text-brand-black">
          Snap the first tiny update for your circle.
        </p>
        <button
          type="button"
          onClick={onOpenCamera}
          className="lmk-primary relative z-10 mt-7 h-[60px] bg-yellow-orange px-5 text-[18px] font-medium text-black"
        >
          open camera
        </button>
      </div>
    );
  }

  return (
    <div className="lmk-page -mx-4 -my-4 min-h-full overflow-hidden px-4 py-5 pb-10 text-center" id="updates-viewer">
      <div className="lmk-shell">
      <div className="relative z-10 mb-4 flex flex-col items-center">
          <h2 className="text-[34px] font-black text-brand-black">Updates</h2>
        <p className="mt-1 max-w-[300px] text-[13px] font-medium text-brand-black">
          review recent activity, notes, time, and last known place
        </p>
        <button
          type="button"
          onClick={onOpenCamera}
          className="mt-3 flex h-11 w-14 items-center justify-center rounded-full bg-yellow-orange text-brand-black shadow-sm"
          aria-label="Open camera"
        >
          <Camera className="h-5 w-5" />
          </button>
      </div>

      <section className="lmk-panel relative z-10 mb-3 p-3 text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-forest" />
          <h3 className="text-sm font-black text-brand-black">Last seen story mode</h3>
        </div>
        <p className="mx-auto max-w-[300px] text-[11px] font-bold text-brand-black/68">
          Trusted people tap through Updates with context like time, note, and last known place.
        </p>
      </section>

      <div className="relative z-10 mb-3 flex gap-1.5">
        {updates.map((update, index) => (
          <button
            key={update.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-1.5 flex-1 rounded-full ${index <= activeIndex ? 'bg-brand-black' : 'bg-white/70'}`}
            aria-label={`Open ${update.name} update`}
          />
        ))}
      </div>

      <div className="relative z-10 mb-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {updates.map((update, index) => (
          <button
            key={update.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="flex flex-none flex-col items-center gap-1"
          >
            <span className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${
              index === activeIndex ? 'border-brand-black' : 'border-white'
            } ${update.color} text-xs font-black shadow-sm`}>
              {update.initials}
            </span>
            <span className="max-w-14 truncate text-[9px] font-bold text-brand-black/72">{update.name}</span>
          </button>
        ))}
      </div>

      <section key={active.id} className="lmk-panel lmk-story-card relative z-10 overflow-hidden p-2">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[28px] bg-brand-black text-left">
          <img
            src={active.photoUrl}
            alt={`${active.name} update`}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-white">
            <div className="flex items-center gap-2">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ${active.color}`}>
                {active.initials}
              </span>
              <div>
                <div className="text-sm font-black leading-none">{active.name}</div>
                <div className="mt-0.5 text-[10px] font-bold text-white/70">{active.exactTime}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {active.tag && (
                <span className="rounded-full bg-white/85 px-3 py-1 text-[10px] font-black text-brand-black">
                  {active.tag}
                </span>
              )}
              {active.mine && (
                <button
                  type="button"
                  onClick={deleteActive}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur"
                  aria-label="Delete this update"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => move(-1)}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur"
            aria-label="Previous update"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur"
            aria-label="Next update"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <div className="mb-2 flex min-w-0 items-center gap-1.5 text-xs font-black">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-yellow-orange" />
              <span className="truncate">{getVisiblePlace(active)}</span>
            </div>
            <p className="text-xl font-black">{active.note}</p>
            <p className="mt-2 rounded-full bg-white/18 px-3 py-1.5 text-[10px] font-bold backdrop-blur">
              Last known: {getVisiblePlace(active)} · {active.exactTime}
            </p>
            {active.detail && (
              <p className="mt-2 rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-bold backdrop-blur">
                {active.detail}
              </p>
            )}
          </div>
        </div>
      </section>

      {active.mine && (
        <section className="lmk-panel relative z-10 mt-3 p-3 text-left">
          <div className="mb-2 flex items-center justify-center gap-2 text-center">
            <Lock className="h-4 w-4 text-forest" />
            <h3 className="text-sm font-black text-brand-black">Privacy for this Update</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onUpdatePrivacy(active.id, { visibility: active.visibility === 'only_me' ? 'circle' : 'only_me' })}
              className={`lmk-tap flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-black ${
                active.visibility === 'only_me' ? 'bg-brand-black text-white' : 'bg-white/82 text-brand-black'
              }`}
            >
              {active.visibility === 'only_me' ? <Lock className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
              {active.visibility === 'only_me' ? 'only me' : 'circle'}
            </button>
            <button
              type="button"
              onClick={() => onUpdatePrivacy(active.id, { hideLocation: !active.hideLocation })}
              className={`lmk-tap flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[10px] font-black ${
                active.hideLocation ? 'bg-pink-accent/75 text-brand-black' : 'bg-white/82 text-brand-black'
              }`}
            >
              <EyeOff className="h-3.5 w-3.5" />
              {active.hideLocation ? 'location hidden' : 'location visible'}
            </button>
          </div>
        </section>
      )}

      {active.attachedLocation && !active.hideLocation && (
        <section className="lmk-panel relative z-10 mt-3 overflow-hidden p-2 text-left">
          {active.attachedLocation.staticMapUrl ? (
            <img
              src={active.attachedLocation.staticMapUrl}
              alt="Google Maps preview of this update location"
              className="h-32 w-full rounded-[28px] object-cover"
            />
          ) : (
            <div className="flex h-32 flex-col items-center justify-center rounded-[28px] bg-white/68 px-4 text-center shadow-inner">
              <MapPin className="mb-2 h-5 w-5 text-forest" />
              <p className="text-xs font-black text-brand-black">Google Maps location attached</p>
              <p className="mt-1 max-w-[260px] text-[10px] font-bold text-brand-black/65">
                {active.attachedLocation.placeName || active.attachedLocation.label}
              </p>
            </div>
          )}
          <a
            href={active.attachedLocation.googleMapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center justify-center rounded-full bg-light-green/80 px-4 py-2 text-[10px] font-black text-forest"
          >
            Open in Google Maps
          </a>
        </section>
      )}

      <div className="relative z-10 mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-full bg-[#f2c0ca]/65 px-4 py-3 text-xs font-black text-brand-black shadow-sm"
        >
          <Heart className="h-4 w-4 text-pink-accent fill-pink-accent" />
          <span>cute</span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-full bg-white/85 px-4 py-3 text-xs font-black text-brand-black shadow-sm"
        >
          <MessageCircle className="h-4 w-4 text-forest" />
          <span>reply</span>
        </button>
      </div>

      <section className="lmk-panel relative z-10 mt-4 p-4 text-left">
        <div className="mb-3 flex items-center justify-center gap-2 text-center">
          <Sparkles className="h-4 w-4 text-yellow-orange" />
          <h3 className="text-sm font-black text-brand-black">AI recap timeline</h3>
        </div>
        <p className="mb-3 text-center text-[11px] font-bold text-brand-black/68">
          What happened today, generated from photos, notes, timestamps, and places.
        </p>
        {aiTimeline.length > 0 ? (
          <div className="space-y-2">
            {aiTimeline.map((item) => (
              <div key={`${item.time}-${item.note}`} className="lmk-timeline-item rounded-[22px] bg-white/72 px-3 py-2 shadow-inner">
                <div className="mb-1 flex items-center gap-2 text-[10px] font-black text-forest/75">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span>{item.time}</span>
                  <span className="ml-auto truncate">{item.place}</span>
                </div>
                <p className="text-xs font-bold text-brand-black/78">{item.note}</p>
                {item.context && (
                  <p className="mt-1 flex items-center gap-1 text-[10px] font-black text-brand-black/55">
                    <Route className="h-3.5 w-3.5 text-forest" />
                    {item.context}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-xs font-bold text-brand-black/70">
            Post a few Updates and LMK will summarize your day here.
          </p>
        )}
      </section>

      <section className="lmk-panel relative z-10 mt-3 p-4 text-left">
        <div className="mb-3 flex items-center justify-center gap-2 text-center">
          <ShieldCheck className="h-4 w-4 text-forest" />
          <h3 className="text-sm font-black text-brand-black">Trusted contact view</h3>
        </div>
        {latestCircleVisible ? (
          <div className="grid grid-cols-[74px_1fr] gap-3 rounded-[26px] bg-white/68 p-3 shadow-inner">
            <img src={latestCircleVisible.photoUrl} alt="Latest visible update" className="h-[92px] w-[74px] rounded-[22px] object-cover" />
            <div className="min-w-0">
              <p className="text-sm font-black text-brand-black">Latest visible Update</p>
              <p className="mt-1 text-xs font-bold text-brand-black/72">{latestCircleVisible.exactTime} · {latestCircleVisible.note}</p>
              <p className="mt-2 text-[10px] font-black text-forest/72">
                Last known: {getVisiblePlace(latestCircleVisible)}
              </p>
              {latestCircleVisible.extractedContext?.vehiclePlate && (
                <p className="mt-1 text-[10px] font-black text-brand-black/58">
                  Plate: {latestCircleVisible.extractedContext.vehiclePlate}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-[26px] bg-white/68 p-3 text-center shadow-inner">
            <p className="text-sm font-black text-brand-black">No circle-visible Updates</p>
            <p className="mx-auto mt-1 max-w-[260px] text-xs font-bold text-brand-black/72">
              Updates marked only me stay out of trusted contact review.
            </p>
          </div>
        )}
      </section>

      <section className="lmk-panel relative z-10 mt-5 p-4 text-left">
        <div className="mb-3 flex items-center justify-center gap-2 text-center">
          <Sparkles className="h-4 w-4 text-yellow-orange" />
          <h3 className="text-sm font-black text-brand-black">Your recap</h3>
        </div>
        {todayUpdates.length > 0 ? (
          <div className="space-y-1">
            <p className="text-sm font-black text-brand-black">
              {todayUpdates.length} update{todayUpdates.length === 1 ? '' : 's'} posted today
            </p>
            <p className="text-xs font-bold text-brand-black/72">
              {todayUpdates.slice(0, 3).map((update) => `${update.exactTime}: ${update.note}`).join(' · ')}
            </p>
            <p className="text-[10px] font-black text-forest/70">
              Last known: {todayUpdates[0] ? getVisiblePlace(todayUpdates[0]) : 'not tagged'}
            </p>
          </div>
        ) : (
          <p className="text-xs font-bold text-brand-black/72">
            Your circle can review your private recap here after you post.
          </p>
        )}
      </section>

      {activeRecap && activeRecapDay && (
        <section className="lmk-panel relative z-10 mt-3 p-4 text-left">
          <div className="mb-3 flex items-center justify-center gap-2 text-center">
            <Users className="h-4 w-4 text-forest" />
            <h3 className="text-sm font-black text-brand-black">Circle recaps</h3>
          </div>

          <div className="mb-3 flex justify-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {friendRecaps.map((recap, index) => (
              <button
                key={recap.name}
                type="button"
                onClick={() => {
                  setActiveRecapIndex(index);
                  setActiveRecapDayIndex(0);
                }}
                className={`flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1.5 text-[10px] font-black shadow-sm ${
                  index === activeRecapIndex ? 'bg-yellow-orange text-brand-black' : 'bg-white/78 text-brand-black/70'
                }`}
              >
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[8px] ${recap.color}`}>
                  {recap.initials}
                </span>
                <span>{recap.name}</span>
              </button>
            ))}
          </div>

          <div className="mb-3 flex justify-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {activeRecap.days.map((day, index) => (
              <button
                key={day.key}
                type="button"
                onClick={() => setActiveRecapDayIndex(index)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black shadow-sm ${
                  index === activeRecapDayIndex ? 'bg-light-green text-forest' : 'bg-white/72 text-brand-black/65'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>

          <div key={`${activeRecap.name}-${activeRecapDay.key}`} className="lmk-recap-card rounded-[26px] bg-white/68 p-3 text-center shadow-inner">
            <p className="text-sm font-black text-brand-black">
              {activeRecap.name} posted {activeRecapDay.entries.length} update{activeRecapDay.entries.length === 1 ? '' : 's'} on {activeRecapDay.label}
            </p>
            <div className="mx-auto mt-2 max-w-[290px] space-y-2 text-left">
              {activeRecapDay.entries.slice(0, 3).map((entry) => (
                <div key={`${entry.exactTime}-${entry.place}`} className="rounded-[20px] bg-white/72 px-3 py-2">
                  <p className="text-[10px] font-black text-forest/75">{entry.exactTime}</p>
                  <p className="mt-0.5 text-xs font-bold text-brand-black/76">{entry.note}</p>
                  <p className="mt-1 text-[10px] font-black text-brand-black/58">Last known: {entry.place}</p>
                  {entry.context && (
                    <p className="mt-1 text-[10px] font-black text-brand-black/48">{entry.context}</p>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-[10px] font-black text-forest/70">
              Latest overall: {activeRecap.places[0] || 'not tagged'} · {activeRecap.latestTime}
            </p>
          </div>
        </section>
      )}

      <section className="lmk-panel relative z-10 mt-3 p-4 text-left">
        <div className="mb-3 flex items-center justify-center gap-2 text-center">
          <CalendarDays className="h-4 w-4 text-forest" />
          <h3 className="text-sm font-black text-brand-black">Date archive</h3>
        </div>
        <p className="mb-3 text-center text-[11px] font-bold text-brand-black/68">
          Pick a date to review older Updates, notes, timestamps, and location tags.
        </p>
        <div className="grid grid-cols-7 gap-1.5">
          {archiveDays.map((day) => (
            <button
              key={day.key}
              type="button"
              onClick={() => day.count > 0 && openDay(day.key)}
              className={`aspect-square rounded-[14px] text-[10px] font-black ${
                day.count > 0
                  ? 'bg-[#cce6fc] text-brand-black shadow-sm'
                  : 'bg-brand-black/5 text-brand-black/55'
              }`}
              aria-label={`${day.label}, ${day.count} updates`}
            >
              <span className="block">{day.date}</span>
              {day.count > 0 && <span className="mx-auto mt-1 block h-1.5 w-1.5 rounded-full bg-forest" />}
            </button>
          ))}
        </div>
      </section>

      {userCheckIns.length > 0 && (
        <section className="lmk-panel relative z-10 mt-3 p-4">
          <InstantsGrid
            checkIns={userCheckIns}
            contacts={contacts}
            title="Your photo review"
          />
        </section>
      )}
      </div>
    </div>
  );
}

function buildFriendRecaps(friendsUpdates: MockUpdate[]) {
  const sortedUpdates = [...friendsUpdates].sort((a, b) => getUpdateTime(b) - getUpdateTime(a));

  const grouped = sortedUpdates.reduce<Record<string, FriendRecap>>((acc, update) => {
    const name = update.friendName.split(' ')[0];
    if (!acc[update.friendName]) {
      acc[update.friendName] = {
        name,
        initials: update.friendInitials,
        color: update.friendColor,
        updateCount: 0,
        places: [],
        notes: [],
        latestTime: update.timeAgo,
        exactTimes: [],
        days: [],
      };
    }

    const dayKey = update.timestamp ? getDayKey(update.timestamp) : 'recent';
    const dayLabel = update.timestamp ? formatRecapDayLabel(update.timestamp) : 'Recent';
    let day = acc[update.friendName].days.find((item) => item.key === dayKey);

    if (!day) {
      day = {
        key: dayKey,
        label: dayLabel,
        entries: [],
      };
      acc[update.friendName].days.push(day);
    }

    const place = update.hideLocation
      ? 'location hidden'
      : update.attachedLocation?.label || update.landmark;
    acc[update.friendName].updateCount += 1;
    acc[update.friendName].places.push(place);
    acc[update.friendName].notes.push(update.note);
    acc[update.friendName].exactTimes.push(update.timestamp ? formatDateTime(update.timestamp) : update.timeAgo);
    day.entries.push({
      note: update.note,
      place,
      exactTime: update.timestamp ? formatDateTime(update.timestamp) : update.timeAgo,
      relativeTime: update.timeAgo,
      context: formatSmartContext(update.extractedContext),
    });

    return acc;
  }, {});

  return Object.values(grouped);
}

function buildAiTimeline(updates: CircleUpdate[]): AiTimelineItem[] {
  return updates
    .filter((update) => update.visibility !== 'only_me')
    .slice(0, 5)
    .map((update) => ({
      time: update.exactTime,
      note: update.extractedContext?.cleanedNote || update.note,
      place: getVisiblePlace(update),
      context: formatSmartContext(update.extractedContext),
    }));
}

function getVisiblePlace(update: Pick<CircleUpdate, 'hideLocation' | 'attachedLocation' | 'landmark'>) {
  if (update.hideLocation) return 'location hidden';
  return update.attachedLocation?.placeName || update.attachedLocation?.label || update.landmark || 'not tagged';
}

function formatSmartContext(context?: CircleUpdate['extractedContext']) {
  if (!context) return undefined;

  const parts = [
    context.activity,
    context.destination ? `to ${context.destination}` : undefined,
    context.vehiclePlate ? `plate ${context.vehiclePlate}` : undefined,
    context.people?.length ? `with ${context.people.join(', ')}` : undefined,
  ].filter(Boolean);

  return parts.length ? parts.join(' · ') : undefined;
}

function getUpdateTime(update: MockUpdate) {
  return update.timestamp ? new Date(update.timestamp).getTime() : 0;
}

function formatRecapDayLabel(isoString: string) {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (getDayKey(isoString) === getDayKey(today.toISOString())) return 'Today';
  if (getDayKey(isoString) === getDayKey(yesterday.toISOString())) return 'Yesterday';

  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(isoString: string) {
  try {
    return new Date(isoString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return 'recently';
  }
}

function formatTimeAgo(isoString: string) {
  try {
    const now = new Date();
    const past = new Date(isoString);
    const diffMins = Math.floor((now.getTime() - past.getTime()) / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  } catch {
    return 'recently';
  }
}

function getDayKey(isoString: string) {
  const date = new Date(isoString);
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function buildArchiveDays(updates: CircleUpdate[]) {
  const counts = updates.reduce<Record<string, number>>((acc, update) => {
    if (update.dayKey) acc[update.dayKey] = (acc[update.dayKey] || 0) + 1;
    return acc;
  }, {});

  return Array.from({ length: 21 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (20 - index));
    const key = getDayKey(date.toISOString());

    return {
      key,
      date: String(date.getDate()),
      label: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      count: counts[key] || 0,
    };
  });
}
