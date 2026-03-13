'use client';

import { useEffect, useState, useRef } from 'react';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
const USER_AGENT = 'WIRABorneoMobile/1.0';
const DEBOUNCE_MS = 400;

interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  state?: string;
  country?: string;
  country_code?: string;
  display_name?: string;
}

interface NominatimResult {
  display_name?: string;
  address?: NominatimAddress;
}

function formatPlaceName(data: NominatimResult | null): string {
  if (!data) return 'Unknown location';
  const addr = data.address;
  if (!addr) return data.display_name || 'Unknown location';
  const parts = [
    addr.city ?? addr.town ?? addr.village ?? addr.municipality,
    addr.state,
    addr.country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : (data.display_name || 'Unknown location');
}

export function useReverseGeocode(location: { latitude: number; longitude: number } | null): {
  placeName: string;
  isLoading: boolean;
} {
  const [placeName, setPlaceName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastCoordsRef = useRef<string>('');

  useEffect(() => {
    if (!location) {
      lastCoordsRef.current = '';
      setPlaceName('');
      setIsLoading(false);
      return;
    }

    const key = `${location.latitude.toFixed(6)},${location.longitude.toFixed(6)}`;
    if (lastCoordsRef.current === key) return;
    lastCoordsRef.current = key;
    setPlaceName('');
    setIsLoading(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      const params = new URLSearchParams({
        lat: String(location.latitude),
        lon: String(location.longitude),
        format: 'json',
      });

      fetch(`${NOMINATIM_URL}?${params}`, {
        method: 'GET',
        headers: { 'User-Agent': USER_AGENT },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data: NominatimResult | null) => {
          setPlaceName(formatPlaceName(data));
        })
        .catch(() => {
          setPlaceName('Unknown location');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [location?.latitude, location?.longitude]);

  return { placeName, isLoading };
}
