'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import { fromLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import Geolocation from 'ol/Geolocation';
import Polygon, { circular } from 'ol/geom/Polygon';
import Overlay from 'ol/Overlay';

interface RiskRegion {
  id: string;
  latitude: number | null;
  longitude: number | null;
  radiusKm: number | null;
  severity: number;
}

interface MapComponentProps {
  weatherLocation?: { latitude: number; longitude: number };
  vulnerableRegions?: RiskRegion[];
}

export default function MapComponent({ weatherLocation, vulnerableRegions = [] }: MapComponentProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const regionsLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const userLocationRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return;

    // 1. Initialize Base Map
    const initialCoords = weatherLocation 
      ? fromLonLat([weatherLocation.longitude, weatherLocation.latitude]) 
      : fromLonLat([110.3592, 1.5533]); // Default to Kuching

    const view = new View({
      center: initialCoords,
      zoom: 12,
    });

    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: view,
    });
    mapRef.current = map;

    // 2. Setup Location Overlay (Current User Position)
    const locationOverlay = new Overlay({
      element: userLocationRef.current!,
      positioning: 'bottom-center',
      stopEvent: false,
    });
    map.addOverlay(locationOverlay);

    // 3. Setup Geolocation
    const geolocation = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: view.getProjection(),
    });

    geolocation.on('change:position', () => {
      const coordinates = geolocation.getPosition();
      if (coordinates) {
        locationOverlay.setPosition(coordinates);
        if (userLocationRef.current) {
          userLocationRef.current.classList.remove('hidden');
        }
        view.animate({ center: coordinates, zoom: 14 });
      }
    });

    geolocation.on('error', (error) => {
      console.warn('Geolocation error:', error.message);
      setError('Could not access device location. Using standard map view.');
    });
    
    // Auto-start tracking explicitly asking for permission first
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Once permission is granted and position found, enable tracking on the map
          const coords = fromLonLat([pos.coords.longitude, pos.coords.latitude]);
          locationOverlay.setPosition(coords);
          if (userLocationRef.current) {
            userLocationRef.current.classList.remove('hidden');
          }
          view.animate({ center: coords, zoom: 14 });
          geolocation.setTracking(true);
        },
        (err) => {
          console.warn('Geolocation prompt error:', err.message);
          setError('Location access denied or unavailable. Using standard view.');
        },
        { enableHighAccuracy: true }
      );
    } else {
        setError("Geolocation is not supported by this browser.");
    }

    // 4. Setup Regions Layer
    const regionsSource = new VectorSource();
    const regionsLayer = new VectorLayer({
      source: regionsSource,
      zIndex: 5,
    });
    map.addLayer(regionsLayer);
    regionsLayerRef.current = regionsLayer;

    return () => {
      geolocation.setTracking(false);
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, [weatherLocation]);

  // Update Regions Layer when data changes
  useEffect(() => {
    if (!regionsLayerRef.current || !vulnerableRegions.length) return;

    const source = regionsLayerRef.current.getSource();
    if (!source) return;

    source.clear();

    const features = vulnerableRegions.map(region => {
      if (!region.latitude || !region.longitude || !region.radiusKm) return null;

      // Create circular polygon for the risk area
      const circlePolygon = circular(
        [region.longitude, region.latitude],
        region.radiusKm * 1000, 
        64 
      ).transform('EPSG:4326', 'EPSG:3857');

      const feature = new Feature({
          geometry: circlePolygon
      });

      // Style based on severity
      const getFillColor = (severity: number) => {
          if (severity > 80) return 'rgba(220, 38, 38, 0.4)'; // Red (Critical)
          if (severity > 50) return 'rgba(234, 179, 8, 0.4)'; // Yellow (Warning)
          return 'rgba(56, 189, 248, 0.4)'; // Blue (Informational)
      };

      feature.setStyle(
        new Style({
          fill: new Fill({ color: getFillColor(region.severity) }),
          stroke: new Stroke({ color: getFillColor(region.severity).replace('0.4', '0.8'), width: 2 })
        })
      );

      return feature;
    }).filter(Boolean) as Feature<Polygon>[];

    source.addFeatures(features);
  }, [vulnerableRegions]);

  return (
    <div className="relative w-full aspect-square rounded-3xl overflow-hidden shadow-wira border border-wira-teal/30">
        <div ref={mapElement} className="w-full h-full" />
        
        {/* 3D Person Pin Overlay */}
        <div ref={userLocationRef} className="absolute hidden pointer-events-none">
          <div className="relative flex items-center justify-center -translate-y-4">
            {/* Ping effect */}
            <div className="absolute w-12 h-12 bg-wira-gold/40 rounded-full animate-ping"></div>
            {/* 3D pin wrapper */}
            <div className="relative z-10 flex flex-col items-center drop-shadow-lg">
              {/* Head */}
              <div className="w-4 h-4 rounded-full bg-wira-gold border-2 border-white shadow-md z-20"></div>
              {/* Body */}
              <div className="w-5 h-6 bg-wira-gold rounded-t-[10px] border-2 border-white shadow-md z-10 -mt-1"></div>
              {/* Shadow */}
              <div className="w-4 h-1.5 bg-black/40 rounded-full blur-[2px] mt-1 relative z-0"></div>
            </div>
          </div>
        </div>

        {error && (
            <div className="absolute top-2 left-2 right-2 bg-red-500/90 text-white text-xs p-2 rounded-lg backdrop-blur-sm shadow-lg border border-red-400">
                {error}
            </div>
        )}
    </div>
  );
}
