'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Fill, Stroke, Style } from 'ol/style';
import CircleStyle from 'ol/style/Circle';
import Geolocation from 'ol/Geolocation';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import Icon from 'ol/style/Icon';
import Polygon, { circular } from 'ol/geom/Polygon';
import Overlay from 'ol/Overlay';
import { boundingExtent } from 'ol/extent';

interface RiskRegion {
  id: string;
  latitude: number | null;
  longitude: number | null;
  radiusKm: number | null;
  severity: number;
}

interface HelpRequest {
  id: string;
  latitude: number;
  longitude: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  hazardType: string;
}

export interface HazardPin {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  hazardType?: string;
  reviewStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | null;
  reporterId?: string | null;
}

export interface EvacuationSite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type?: string | null;
  capacity?: string | null;
  population?: string | null;
  source?: string | null;
}

export interface HazardRiskPoint {
  latitude: number;
  longitude: number;
  risk: number;
  elevation?: number;
  stagnation?: number;
  vulnerability?: number;
}

interface MapComponentProps {
  weatherLocation?: { latitude: number; longitude: number };
  vulnerableRegions?: RiskRegion[];
  helpRequests?: HelpRequest[];
  /** Hazard pins visible to user (approved + own); styled by reviewStatus. */
  hazardPins?: HazardPin[];
  focusedHelpRequestId?: string | null;
  mapFocus?: { latitude: number; longitude: number } | null;
  homeLocation?: { latitude: number; longitude: number } | null;
  evacuationSites?: EvacuationSite[];
  onEvacClick?: (evac: EvacuationSite) => void;
  /** OSRM route geometry (GeoJSON [lon, lat][]). When set, drawn instead of straight line. */
  routeGeometry?: [number, number][] | null;
  /** Hazard-aware (safest) route geometry; drawn in a different color from OSRM route. */
  hazardRouteGeometry?: [number, number][] | null;
  routeEta?: { durationSeconds: number; distanceMeters: number } | null;
  /** Risk points from hazard server for map layer; color by risk, hover for details. */
  hazardRiskPoints?: HazardRiskPoint[];
  /** When set, map click returns lat/lon for location picker (e.g. hazard pin / help request). */
  onMapClick?: (latitude: number, longitude: number) => void;
  /** When true, wrapper uses w-full h-full instead of aspect-square for embedded use (e.g. SOS page). */
  fillContainer?: boolean;
}

/** Returns SVG markup for the evac marker based on type so not all look like churches. */
function getEvacIconSvg(type: string | null | undefined): string {
  const t = (type ?? '').toLowerCase();
  const fill = '#0D9488';
  const stroke = 'white';
  switch (t) {
    case 'campus':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16v12H4V6z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><path d="M8 10h8M8 14h5" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round"/></svg>`;
    case 'church':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><path d="M12 8v8M9 11h6" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round"/></svg>`;
    case 'shelter':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><path d="M9 22V12h6v10" fill="${stroke}" opacity="0.5"/></svg>`;
    case 'hospital':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><path d="M12 7v10M8 11h8" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round"/></svg>`;
    case 'sports center':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><path d="M12 5v14M5 12h14" stroke="${stroke}" stroke-width="1.2"/></svg>`;
    case 'barangay hall':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h6v16H4V4zM14 4h6v8h-6V4z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><path d="M7 8h2M7 11h2M16 6h2" stroke="${stroke}" stroke-width="1"/></svg>`;
    case 'field':
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="12" rx="10" ry="8" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><path d="M12 8v8M8 12h8" stroke="${stroke}" stroke-width="1.2" stroke-linecap="round"/></svg>`;
    default:
      return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L4 6v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V6l-8-4z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><circle cx="12" cy="11" r="3" fill="${stroke}" opacity="0.9"/></svg>`;
  }
}

/** Solid teardrop pin SVG (no outline); fill color for status. */
function getHazardPinSvg(fill: string): string {
  return `<svg width="24" height="32" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C5.5 2 0 7.5 0 14c0 8 12 18 12 18s12-10 12-18C24 7.5 18.5 2 12 2zm0 10a4 4 0 100-8 4 4 0 000 8z" fill="${fill}"/></svg>`;
}

/** Risk value to color: green (low), yellow (mid), red (high). */
function getRiskColor(risk: number): string {
  if (risk <= 1 / 3) return '#22c55e';
  if (risk <= 2 / 3) return '#eab308';
  return '#dc2626';
}

export default function MapComponent({
  weatherLocation,
  vulnerableRegions = [],
  helpRequests = [],
  hazardPins = [],
  focusedHelpRequestId,
  mapFocus,
  homeLocation,
  evacuationSites = [],
  onEvacClick,
  routeGeometry,
  hazardRouteGeometry,
  hazardRiskPoints = [],
  onMapClick,
  fillContainer = false,
}: MapComponentProps) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const regionsLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const helpLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const hazardLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const riskLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const homeLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const evacLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const routeLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const hazardRouteLayerRef = useRef<VectorLayer<VectorSource> | null>(null);
  const riskHoverPopupRef = useRef<HTMLDivElement>(null);
  const userLocationRef = useRef<HTMLDivElement>(null);
  const onEvacClickRef = useRef(onEvacClick);
  onEvacClickRef.current = onEvacClick;
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;
  const [error, setError] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<number[] | null>(null);

  useEffect(() => {
    if (!mapElement.current || mapRef.current) return;

    // 1. Initialize Base Map (created once)
    const initial = weatherLocation ?? { latitude: 1.5533, longitude: 110.3592 };
    const initialCoords = fromLonLat([initial.longitude, initial.latitude]); // Default to Kuching

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
        setUserCoords(coordinates);
        locationOverlay.setPosition(coordinates);
        // Only auto-animate if NOT focused on something specific
        if (!mapFocus) {
          view.animate({ center: coordinates, zoom: 14 });
        }
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
          setUserCoords(coords);
          locationOverlay.setPosition(coords);
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

    // 5. Setup Help Requests Layer
    const helpSource = new VectorSource();
    const helpLayer = new VectorLayer({
      source: helpSource,
      zIndex: 10,
    });
    map.addLayer(helpLayer);
    helpLayerRef.current = helpLayer;

    // 5b. Setup Hazard Pins Layer
    const hazardSource = new VectorSource();
    const hazardLayer = new VectorLayer({
      source: hazardSource,
      zIndex: 9,
    });
    map.addLayer(hazardLayer);
    hazardLayerRef.current = hazardLayer;

    // 6. Setup Home Layer
    const homeSource = new VectorSource();
    const homeLayer = new VectorLayer({
      source: homeSource,
      zIndex: 9,
    });
    map.addLayer(homeLayer);
    homeLayerRef.current = homeLayer;

    // 7. Setup Evacuation Sites Layer
    const evacSource = new VectorSource();
    const evacLayer = new VectorLayer({
      source: evacSource,
      zIndex: 7,
    });
    map.addLayer(evacLayer);
    evacLayerRef.current = evacLayer;

    // 7b. Setup Hazard Risk Points Layer (graph nodes from hazard server)
    const riskSource = new VectorSource();
    const riskLayer = new VectorLayer({
      source: riskSource,
      zIndex: 6,
    });
    map.addLayer(riskLayer);
    riskLayerRef.current = riskLayer;

    // 7c. Hover overlay for risk point details
    const hoverOverlay = new Overlay({
      element: riskHoverPopupRef.current!,
      positioning: 'bottom-center',
      offset: [0, -8],
      stopEvent: false,
    });
    map.addOverlay(hoverOverlay);
    map.on('pointermove', (evt) => {
      const hit = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      const riskData = hit?.get('riskData') as HazardRiskPoint | undefined;
      if (riskData && riskHoverPopupRef.current) {
        riskHoverPopupRef.current.innerHTML = [
          `Risk: ${(riskData.risk * 100).toFixed(1)}%`,
          riskData.elevation != null ? `Elevation: ${riskData.elevation.toFixed(0)} m` : '',
          riskData.stagnation != null ? `Stagnation: ${riskData.stagnation.toFixed(2)}` : '',
          riskData.vulnerability != null ? `Vulnerability: ${riskData.vulnerability.toFixed(2)}` : '',
        ].filter(Boolean).join(' · ');
        riskHoverPopupRef.current.style.display = 'block';
        hoverOverlay.setPosition(evt.coordinate);
      } else if (riskHoverPopupRef.current) {
        riskHoverPopupRef.current.style.display = 'none';
        hoverOverlay.setPosition(undefined);
      }
    });

    map.on('click', (evt) => {
      if (onMapClickRef.current) {
        const coord = map.getCoordinateFromPixel(evt.pixel);
        if (coord) {
          const [lon, lat] = toLonLat(coord);
          onMapClickRef.current(lat, lon);
        }
        return;
      }
      const hit = map.forEachFeatureAtPixel(evt.pixel, (f) => f);
      const evac = hit?.get('evac') as EvacuationSite | undefined;
      if (evac && onEvacClickRef.current) onEvacClickRef.current(evac);
    });

    // 8. Setup Route Layer (OSRM – fastest)
    const routeSource = new VectorSource();
    const routeLayer = new VectorLayer({
      source: routeSource,
      zIndex: 9,
      style: [
        new Style({
          stroke: new Stroke({
            color: 'rgba(250, 204, 21, 0.4)',
            width: 12,
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: '#FDE047',
            width: 4,
            lineDash: [6, 6],
          }),
        }),
      ],
    });
    map.addLayer(routeLayer);
    routeLayerRef.current = routeLayer;

    // 9. Setup Hazard Route Layer (safest – different color)
    const hazardRouteSource = new VectorSource();
    const hazardRouteLayer = new VectorLayer({
      source: hazardRouteSource,
      zIndex: 8,
      style: [
        new Style({
          stroke: new Stroke({
            color: 'rgba(34, 197, 94, 0.5)',
            width: 10,
          }),
        }),
        new Style({
          stroke: new Stroke({
            color: '#22c55e',
            width: 4,
          }),
        }),
      ],
    });
    map.addLayer(hazardRouteLayer);
    hazardRouteLayerRef.current = hazardRouteLayer;

    return () => {
      geolocation.setTracking(false);
      map.setTarget(undefined);
      mapRef.current = null;
    };
  }, []);

  // Sync map view center when weatherLocation changes, without recreating the map
  useEffect(() => {
    if (!mapRef.current || !weatherLocation) return;
    const view = mapRef.current.getView();
    const coords = fromLonLat([weatherLocation.longitude, weatherLocation.latitude]);
    view.animate({ center: coords, duration: 300 });
  }, [weatherLocation?.latitude, weatherLocation?.longitude]);

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

  // Update Help Requests Layer
  useEffect(() => {
    if (!helpLayerRef.current) return;
    const source = helpLayerRef.current.getSource();
    if (!source) return;

    source.clear();

    const features = helpRequests.map(req => {
      const isFocused = req.id === focusedHelpRequestId;
      const point = new Point(fromLonLat([req.longitude, req.latitude]));
      const feature = new Feature({
        geometry: point,
      });

      const color = req.urgency === 'CRITICAL' ? '#DC2626' : '#EAB308';
      
      feature.setStyle(new Style({
        image: new Icon({
          src: `data:image/svg+xml;utf8,${encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 30L16 30C12 26 6 18 6 12C6 6.47715 10.4772 2 16 2C21.5228 2 26 6.47715 26 12C26 18 20 26 16 30Z" fill="${color}" stroke="white" stroke-width="2"/>
              <circle cx="16" cy="12" r="4" fill="white"/>
              ${isFocused ? '<circle cx="16" cy="12" r="8" stroke="white" stroke-width="2" opacity="0.5"><animate attributeName="r" from="8" to="16" dur="1.5s" repeatCount="indefinite" /><animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" /></circle>' : ''}
            </svg>
          `)}`,
          scale: isFocused ? 1.2 : 1,
          anchor: [0.5, 1],
        })
      }));

      return feature;
    });

    source.addFeatures(features);
  }, [helpRequests, focusedHelpRequestId]);

  // Update Hazard Pins Layer
  useEffect(() => {
    if (!hazardLayerRef.current) return;
    const source = hazardLayerRef.current.getSource();
    if (!source) return;

    source.clear();

    const list = Array.isArray(hazardPins) ? hazardPins : [];

    const features = list.map((pin) => {
      const point = new Point(fromLonLat([pin.longitude, pin.latitude]));
      const feature = new Feature({ geometry: point });

      const fill =
        pin.reviewStatus === 'REJECTED'
          ? '#6B7280'
          : pin.reviewStatus === 'PENDING'
            ? '#EAB308'
            : '#0D9488';

      feature.setStyle(
        new Style({
          image: new Icon({
            src: `data:image/svg+xml;utf8,${encodeURIComponent(getHazardPinSvg(fill))}`,
            scale: 1,
            anchor: [0.5, 1],
          }),
        }),
      );

      return feature;
    });

    source.addFeatures(features);
  }, [hazardPins]);

  // Update Hazard Risk Points Layer (color by risk: green / yellow / red)
  useEffect(() => {
    if (!riskLayerRef.current) return;
    const source = riskLayerRef.current.getSource();
    if (!source) return;
    source.clear();
    if (!hazardRiskPoints.length) return;
    const features = hazardRiskPoints.map((p) => {
      const point = new Point(fromLonLat([p.longitude, p.latitude]));
      const feature = new Feature({ geometry: point });
      feature.set('riskData', p);
      const color = getRiskColor(p.risk);
      feature.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 4,
            fill: new Fill({ color }),
            stroke: new Stroke({ color: '#fff', width: 1 }),
          }),
        }),
      );
      return feature;
    });
    source.addFeatures(features);
  }, [hazardRiskPoints]);

  // Update Home marker
  useEffect(() => {
    if (!homeLayerRef.current || !homeLocation) return;
    const source = homeLayerRef.current.getSource();
    if (!source) return;
    source.clear();
    const point = new Point(fromLonLat([homeLocation.longitude, homeLocation.latitude]));
    const feature = new Feature({ geometry: point });
    feature.setStyle(new Style({
      image: new Icon({
        src: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" fill="#0D9488" stroke="white" stroke-width="2"/>
            <polygon points="9 22 9 12 15 12 15 22" fill="white" opacity="0.9"/>
          </svg>
        `)}`,
        scale: 1,
        anchor: [0.5, 1],
      })
    }));
    source.addFeature(feature);
  }, [homeLocation]);

  // Update Evacuation Sites layer (icon per type so not all look like churches)
  useEffect(() => {
    if (!evacLayerRef.current) return;
    const source = evacLayerRef.current.getSource();
    if (!source) return;
    source.clear();
    if (!evacuationSites.length) return;
    const features = evacuationSites.map((evac) => {
      const point = new Point(fromLonLat([evac.longitude, evac.latitude]));
      const feature = new Feature({ geometry: point });
      feature.set('evac', evac);
      const svg = getEvacIconSvg(evac.type);
      feature.setStyle(new Style({
        image: new Icon({
          src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
          scale: 1,
          anchor: [0.5, 1],
        })
      }));
      return feature;
    });
    source.addFeatures(features);
  }, [evacuationSites]);

  // Update Route / Navigation Path (OSRM – fastest)
  useEffect(() => {
    if (!routeLayerRef.current || !mapRef.current) return;
    const source = routeLayerRef.current.getSource();
    if (!source) return;

    source.clear();

    if (!mapFocus) return;

    const targetCoords = fromLonLat([mapFocus.longitude, mapFocus.latitude]);
    let routeCoords: number[][];

    if (routeGeometry && routeGeometry.length >= 2) {
      routeCoords = routeGeometry.map(([lon, lat]) => fromLonLat([lon, lat]));
    } else if (userCoords) {
      routeCoords = [userCoords, targetCoords];
    } else {
      return;
    }

    const line = new Feature({
      geometry: new LineString(routeCoords),
    });
    source.addFeature(line);

    const pin = new Feature({
      geometry: new Point(targetCoords),
    });
    pin.setStyle(new Style({
      image: new Icon({
        src: `data:image/svg+xml;utf8,${encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 30L16 30C12 26 6 18 6 12C6 6.47715 10.4772 2 16 2C21.5228 2 26 6.47715 26 12C26 18 20 26 16 30Z" fill="#FACC15" stroke="white" stroke-width="2"/>
            <circle cx="16" cy="12" r="4" fill="white"/>
          </svg>
        `)}`,
        anchor: [0.5, 1],
      })
    }));
    source.addFeature(pin);

    const extent = boundingExtent(routeCoords);
    mapRef.current.getView().fit(extent, {
      padding: [120, 80, 250, 80],
      duration: 1000,
      maxZoom: 16,
    });
  }, [mapFocus, userCoords, routeGeometry]);

  // Update Hazard Route Layer (safest – green)
  useEffect(() => {
    if (!hazardRouteLayerRef.current) return;
    const source = hazardRouteLayerRef.current.getSource();
    if (!source) return;
    source.clear();
    if (hazardRouteGeometry && hazardRouteGeometry.length >= 2) {
      const coords = hazardRouteGeometry.map(([lon, lat]) => fromLonLat([lon, lat]));
      source.addFeature(new Feature({ geometry: new LineString(coords) }));
    }
  }, [hazardRouteGeometry]);

  const wrapperClass = fillContainer
    ? 'relative w-full h-full rounded-xl overflow-hidden'
    : 'relative w-full aspect-square rounded-3xl overflow-hidden shadow-wira border border-wira-teal/30';

  return (
    <div className={wrapperClass}>
        <div ref={mapElement} className="w-full h-full" />
        <div
          ref={riskHoverPopupRef}
          className="absolute px-2 py-1 text-xs font-body text-wira-earth bg-white/95 border border-wira-teal/30 rounded shadow-lg pointer-events-none whitespace-nowrap"
          style={{ display: 'none' }}
        />
        {/* 3D Person Pin Overlay */}
        <div ref={userLocationRef} className={`absolute pointer-events-none ${!userCoords ? 'hidden' : ''}`}>
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
