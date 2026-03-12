'use client';

import React, { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';

interface FormLocationPickerMapProps {
  center: { latitude: number; longitude: number } | null;
  onLocationChange: (loc: { latitude: number; longitude: number }) => void;
  fallback: { latitude: number; longitude: number };
}

export default function FormLocationPickerMap({
  center,
  onLocationChange,
  fallback,
}: FormLocationPickerMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const skipNextMoveendRef = useRef(false);
  const onLocationChangeRef = useRef(onLocationChange);
  onLocationChangeRef.current = onLocationChange;

  // Create map once; initial center from first render
  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    const initial = center ?? fallback;
    const initialCoords = fromLonLat([initial.longitude, initial.latitude]);

    const view = new View({
      center: initialCoords,
      zoom: 14,
    });

    const map = new Map({
      target: mapElementRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view,
    });
    mapRef.current = map;

    map.on('moveend', () => {
      if (skipNextMoveendRef.current) {
        skipNextMoveendRef.current = false;
        return;
      }
      const viewCenter = view.getCenter();
      if (!viewCenter) return;
      const [lon, lat] = toLonLat(viewCenter);
      onLocationChangeRef.current({ latitude: lat, longitude: lon });
    });

    return () => {
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- map created once

  // Sync view when center is set from outside (e.g. geolocation)
  useEffect(() => {
    if (!mapRef.current || !center) return;
    skipNextMoveendRef.current = true;
    const coords = fromLonLat([center.longitude, center.latitude]);
    mapRef.current.getView().animate({ center: coords, duration: 300 });
  }, [center?.latitude, center?.longitude]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapElementRef} className="w-full h-full" />
      {/* Fixed center pin: solid teardrop with transparent center, no outline */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none z-10 flex flex-col items-center drop-shadow-md"
        aria-hidden
      >
        <svg
          width="32"
          height="40"
          viewBox="0 0 24 32"
          fill="none"
          className="text-wira-teal"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C5.5 2 0 7.5 0 14c0 8 12 18 12 18s12-10 12-18C24 7.5 18.5 2 12 2zm0 10a4 4 0 100-8 4 4 0 000 8z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
}
