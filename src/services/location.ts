import { AttachedLocation } from '../types';

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const GOOGLE_MAPS_KEY = env.VITE_GOOGLE_MAPS_API_KEY;

type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

export async function getCurrentGoogleMapsLocation(): Promise<AttachedLocation | undefined> {
  if (!navigator.geolocation) return undefined;

  const coords = await new Promise<Coordinates | undefined>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => resolve(undefined),
      { enableHighAccuracy: true, maximumAge: 45000, timeout: 7000 }
    );
  });

  if (!coords) return undefined;

  const label = await reverseGeocode(coords).catch(() => undefined);

  return buildAttachedLocation({
    ...coords,
    label: label || formatCoordinateLabel(coords),
  });
}

export function buildAttachedLocation({
  latitude,
  longitude,
  accuracy,
  label,
}: Coordinates & { label: string }): AttachedLocation {
  const query = `${latitude},${longitude}`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const staticMapUrl = GOOGLE_MAPS_KEY
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(query)}&zoom=15&size=640x360&scale=2&markers=color:yellow%7C${encodeURIComponent(query)}&key=${encodeURIComponent(GOOGLE_MAPS_KEY)}`
    : undefined;

  return {
    latitude,
    longitude,
    accuracy,
    label,
    capturedAt: new Date().toISOString(),
    googleMapsUrl,
    staticMapUrl,
  };
}

export function formatCoordinateLabel({ latitude, longitude }: Coordinates) {
  return `near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

async function reverseGeocode({ latitude, longitude }: Coordinates) {
  if (!GOOGLE_MAPS_KEY) return undefined;

  const params = new URLSearchParams({
    latlng: `${latitude},${longitude}`,
    key: GOOGLE_MAPS_KEY,
    result_type: 'street_address|premise|point_of_interest|establishment|route',
  });

  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`);
  if (!response.ok) return undefined;

  const data = await response.json() as {
    status?: string;
    results?: Array<{ formatted_address?: string }>;
  };

  return data.status === 'OK' ? data.results?.[0]?.formatted_address : undefined;
}
