import { AttachedLocation } from '../types';

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const GOOGLE_MAPS_KEY = env.VITE_GOOGLE_MAPS_API_KEY;

type Coordinates = {
  latitude: number;
  longitude: number;
  accuracy?: number;
};

type NamedLocation = {
  label: string;
  placeName?: string;
  address?: string;
  placeId?: string;
  googleMapsUrl?: string;
  source: AttachedLocation['source'];
};

const NEARBY_PLACE_TYPES = [
  'university',
  'school',
  'library',
  'cafe',
  'restaurant',
  'bar',
  'night_club',
  'shopping_mall',
  'store',
  'train_station',
  'bus_station',
  'transit_station',
  'airport',
  'lodging',
  'park',
  'tourist_attraction',
  'gym',
  'hospital',
  'movie_theater',
];

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

  const namedLocation = await resolveNamedLocation(coords).catch(() => undefined);

  return buildAttachedLocation({
    ...coords,
    ...(namedLocation || deviceLocationLabel(coords)),
  });
}

export function buildAttachedLocation({
  latitude,
  longitude,
  accuracy,
  label,
  placeName,
  address,
  placeId,
  googleMapsUrl: resolvedGoogleMapsUrl,
  source,
}: Coordinates & NamedLocation): AttachedLocation {
  const query = `${latitude},${longitude}`;
  const googleMapsUrl = resolvedGoogleMapsUrl || (
    placeId
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}&query_place_id=${encodeURIComponent(placeId)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  );
  const staticMapUrl = GOOGLE_MAPS_KEY
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(query)}&zoom=16&size=640x360&scale=2&markers=color:yellow%7Clabel:L%7C${encodeURIComponent(query)}&key=${encodeURIComponent(GOOGLE_MAPS_KEY)}`
    : undefined;

  return {
    latitude,
    longitude,
    accuracy,
    label,
    placeName,
    address,
    placeId,
    source,
    capturedAt: new Date().toISOString(),
    googleMapsUrl,
    staticMapUrl,
  };
}

export function formatCoordinateLabel({ latitude, longitude }: Coordinates) {
  return `near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

async function resolveNamedLocation(coords: Coordinates): Promise<NamedLocation | undefined> {
  if (!GOOGLE_MAPS_KEY) return undefined;

  const nearbyPlace = await findNearbyPlace(coords).catch(() => undefined);
  if (nearbyPlace) return nearbyPlace;

  return reverseGeocode(coords);
}

async function findNearbyPlace({ latitude, longitude, accuracy }: Coordinates): Promise<NamedLocation | undefined> {
  if (!GOOGLE_MAPS_KEY) return undefined;

  const radius = Math.max(60, Math.min(280, Math.round(accuracy || 120)));
  const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_MAPS_KEY,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.shortFormattedAddress',
        'places.googleMapsUri',
        'places.location',
        'places.primaryType',
      ].join(','),
    },
    body: JSON.stringify({
      includedTypes: NEARBY_PLACE_TYPES,
      maxResultCount: 8,
      rankPreference: 'DISTANCE',
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius,
        },
      },
    }),
  });

  if (!response.ok) return undefined;

  const data = await response.json() as {
    places?: Array<{
      id?: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      shortFormattedAddress?: string;
      googleMapsUri?: string;
      location?: { latitude?: number; longitude?: number };
      primaryType?: string;
    }>;
  };

  const place = data.places
    ?.filter((item) => item.displayName?.text)
    .sort((a, b) => (
      distanceFrom(latitude, longitude, a.location) - distanceFrom(latitude, longitude, b.location)
    ))[0];

  if (!place?.displayName?.text) return undefined;

  const placeName = place.displayName.text;
  const address = place.shortFormattedAddress || place.formattedAddress;

  return {
    label: address ? `${placeName} · ${address}` : placeName,
    placeName,
    address,
    placeId: place.id,
    googleMapsUrl: place.googleMapsUri,
    source: 'google_places',
  };
}

async function reverseGeocode({ latitude, longitude }: Coordinates): Promise<NamedLocation | undefined> {
  if (!GOOGLE_MAPS_KEY) return undefined;

  const params = new URLSearchParams({
    latlng: `${latitude},${longitude}`,
    key: GOOGLE_MAPS_KEY,
    result_type: 'premise|point_of_interest|establishment|street_address|route|neighborhood|locality',
  });

  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`);
  if (!response.ok) return undefined;

  const data = await response.json() as {
    status?: string;
    results?: Array<{
      formatted_address?: string;
      place_id?: string;
      types?: string[];
      address_components?: Array<{
        long_name: string;
        short_name: string;
        types: string[];
      }>;
    }>;
  };

  if (data.status !== 'OK') return undefined;

  const result = data.results?.find((item) => (
    item.types?.some((type) => ['premise', 'point_of_interest', 'establishment', 'street_address'].includes(type))
  )) || data.results?.[0];

  if (!result?.formatted_address) return undefined;

  const placeName = pickAddressName(result.address_components) || result.formatted_address.split(',')[0];

  return {
    label: result.formatted_address,
    placeName,
    address: result.formatted_address,
    placeId: result.place_id,
    source: 'google_geocode',
  };
}

function deviceLocationLabel({ accuracy }: Coordinates): NamedLocation {
  return {
    label: accuracy && accuracy > 200
      ? 'Approximate Google Maps location'
      : 'Google Maps location attached',
    source: 'device',
  };
}

function pickAddressName(components?: Array<{ long_name: string; types: string[] }>) {
  return components?.find((component) => (
    component.types.some((type) => ['premise', 'point_of_interest', 'establishment', 'neighborhood', 'locality'].includes(type))
  ))?.long_name;
}

function distanceFrom(latitude: number, longitude: number, placeLocation?: { latitude?: number; longitude?: number }) {
  if (typeof placeLocation?.latitude !== 'number' || typeof placeLocation.longitude !== 'number') {
    return Number.MAX_SAFE_INTEGER;
  }

  const latDistance = latitude - placeLocation.latitude;
  const lngDistance = longitude - placeLocation.longitude;
  return Math.sqrt((latDistance * latDistance) + (lngDistance * lngDistance));
}
