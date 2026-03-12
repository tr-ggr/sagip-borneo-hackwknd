'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import FormLocationPickerMap from './FormLocationPickerMap';
import { useReverseGeocode } from '../hooks/useReverseGeocode';

const DEFAULT_FALLBACK = { latitude: 1.5533, longitude: 110.3592 };

interface FormLocationMapProps {
  location: { latitude: number; longitude: number } | null;
  onLocationChange: (loc: { latitude: number; longitude: number }) => void;
  fallback?: { latitude: number; longitude: number };
  label?: string;
}

export default function FormLocationMap({
  location,
  onLocationChange,
  fallback = DEFAULT_FALLBACK,
  label = 'Location',
}: FormLocationMapProps) {
  const { placeName, isLoading } = useReverseGeocode(location);

  return (
    <div className="form-location-block space-y-3">
      <div className="wira-card p-4 bg-wira-ivory-dark/20 border-dashed border-wira-earth/10">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-wira-teal/10 flex items-center justify-center shrink-0">
            <MapPin size={18} className="text-wira-teal" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="form-label text-[11px] tracking-wider">{label}</p>
            {location ? (
              <>
                <p className="form-hint font-mono text-xs">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
                <p className="form-hint text-xs">
                  {isLoading ? 'Loading…' : placeName || 'Unknown location'}
                </p>
              </>
            ) : (
              <p className="form-hint">Detecting…</p>
            )}
          </div>
        </div>
      </div>
      <div className="rounded-xl overflow-hidden border border-wira-ivory-dark h-[260px]">
        <FormLocationPickerMap
          center={location}
          onLocationChange={onLocationChange}
          fallback={fallback}
        />
      </div>
      <p className="text-[10px] form-hint">Drag the map to move the pin; the pin shows the selected location.</p>
    </div>
  );
}
