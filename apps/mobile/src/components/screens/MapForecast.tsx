'use client';

import React from 'react';

import {
  useAuthControllerUpdateLocation,
  useRiskIntelligenceControllerGetForecast,
  useRiskIntelligenceControllerGetVulnerableRegions,
  useHelpRequestsControllerListOpen,
  useDamageReportsControllerFindVisible,
  usePinsControllerFindVisible,
  useVolunteersControllerGetStatus,
  useRoutingControllerGetRoute,
  useEvacuationControllerAreas,
  useEvacuationControllerRoute,
  useHazardRiskLayerControllerGetRiskLayer,
} from '@wira-borneo/api-client';
import MapComponent, { type EvacuationSite, type HazardRiskPoint } from '../MapComponent';
import { X, Navigation2, MapPin, Home } from 'lucide-react';

export type RouteOrigin = 'current' | 'home';

function hasValidCoordinates(latitude: unknown, longitude: unknown): latitude is number {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

export default function MapForecast({
  focusedHelpRequestId,
  mapFocus,
  mapFocusLabel,
  mapFocusEvac,
  setMapFocus,
  setMapFocusLabel,
  setMapFocusEvac,
  showAllPins,
  onCancelRouting,
  pickLocationFor = null,
  onLocationPicked,
}: {
  focusedHelpRequestId: string | null;
  mapFocus: { latitude: number, longitude: number } | null;
  mapFocusLabel: string | null;
  mapFocusEvac: EvacuationSite | null;
  setMapFocus: (loc: { latitude: number; longitude: number } | null) => void;
  setMapFocusLabel: (label: string | null) => void;
  setMapFocusEvac: (evac: EvacuationSite | null) => void;
  showAllPins: boolean;
  onCancelRouting: () => void;
  pickLocationFor?: 'hazard' | 'help' | null;
  onLocationPicked?: (latitude: number, longitude: number) => void;
}) {
  const [userLocation, setUserLocation] = React.useState<{ latitude: number, longitude: number } | null>(null);
  const [routeOrigin, setRouteOrigin] = React.useState<RouteOrigin>('current');
  const [selectedLocationForWeather, setSelectedLocationForWeather] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const updateLocationSnapshot = useAuthControllerUpdateLocation();

  React.useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        if (!hasValidCoordinates(latitude, longitude)) {
          return;
        }

        setUserLocation({ latitude, longitude });
        updateLocationSnapshot.mutate({ data: { latitude, longitude } });
      });
    }
  }, [updateLocationSnapshot]);

  const activeLoc = mapFocus || userLocation || { latitude: 1.5533, longitude: 110.3592 };

  // Base forecast for current/active location (background)
  useRiskIntelligenceControllerGetForecast({
    latitude: activeLoc.latitude,
    longitude: activeLoc.longitude,
  });

  // Forecast for user-selected point on the map (shown in panel), without reloading map
  const { data: clickedForecast } = useRiskIntelligenceControllerGetForecast(
    selectedLocationForWeather ?? activeLoc,
    { query: { enabled: !!selectedLocationForWeather } },
  );

  const { data: vulnerableRegions } = useRiskIntelligenceControllerGetVulnerableRegions();
  const { data: openRequests } = useHelpRequestsControllerListOpen();
  const { data: hazardPins } = usePinsControllerFindVisible();
  const { data: damageReports } = useDamageReportsControllerFindVisible();
  const { data: volunteerStatus } = useVolunteersControllerGetStatus();
  const status = volunteerStatus as { profile?: { baseLatitude?: number; baseLongitude?: number } } | null | undefined;
  const profile = status?.profile;
  const homeLocation =
    profile?.baseLatitude != null && profile?.baseLongitude != null
      ? { latitude: profile.baseLatitude, longitude: profile.baseLongitude }
      : null;

  const routeFrom = routeOrigin === 'home' && homeLocation ? homeLocation : userLocation;
  const routeParams =
    mapFocus && routeFrom
      ? {
          fromLon: routeFrom.longitude,
          fromLat: routeFrom.latitude,
          toLon: mapFocus.longitude,
          toLat: mapFocus.latitude,
        }
      : null;

  const { data: routeResponse } = useRoutingControllerGetRoute(
    routeParams ?? { fromLon: 0, fromLat: 0, toLon: 0, toLat: 0 },
    { query: { enabled: !!routeParams } }
  );

  const routePayload = routeResponse as { route?: { geometry?: { coordinates?: [number, number][] }; durationSeconds?: number; distanceMeters?: number } } | null | undefined;
  const routeData = routePayload?.route;
  const routeGeometry = routeData?.geometry?.coordinates ?? null;
  const routeEta =
    routeData && routeData.durationSeconds != null && routeData.distanceMeters != null
      ? { durationSeconds: routeData.durationSeconds, distanceMeters: routeData.distanceMeters }
      : null;

  const hazardRouteParams =
    mapFocusEvac && routeFrom
      ? {
          latitude: routeFrom.latitude,
          longitude: routeFrom.longitude,
          evacuationAreaId: mapFocusEvac.id,
          rainfall_mm: 0,
        }
      : undefined;
  const { data: hazardRouteResponse } = useEvacuationControllerRoute(
    hazardRouteParams ?? { latitude: 0, longitude: 0, evacuationAreaId: '' },
    { query: { enabled: !!hazardRouteParams } },
  );
  const hazardRouteGeometry = (hazardRouteResponse as { geometry?: { coordinates?: [number, number][] } } | undefined)?.geometry?.coordinates ?? null;

  const [showRiskLayer, setShowRiskLayer] = React.useState(true);
  const { data: riskLayerData } = useHazardRiskLayerControllerGetRiskLayer(
    { rainfall_mm: 0 },
    { query: { enabled: showRiskLayer } },
  );
  const hazardRiskPoints: HazardRiskPoint[] = Array.isArray(riskLayerData) ? (riskLayerData as HazardRiskPoint[]) : [];

  const { data: areasData } = useEvacuationControllerAreas();
  const areasList = Array.isArray(areasData) ? areasData : [];
  type AreaItem = { id: string; name: string; latitude: number; longitude: number; type?: string | null; capacity?: string | null; population?: string | null; source?: string | null };
  const evacuationSites: EvacuationSite[] = areasList.map((a: AreaItem) => ({
    id: a.id,
    name: a.name,
    latitude: a.latitude,
    longitude: a.longitude,
    type: a.type ?? null,
    capacity: a.capacity ?? null,
    population: a.population ?? null,
    source: a.source ?? null,
  }));

  // Derive evac types for filters
  const evacTypes = Array.from(
    new Set(
      evacuationSites
        .map((e) => (e.type ?? '').trim())
        .filter((t) => t.length > 0),
    ),
  );

  const [evacTypeFilter, setEvacTypeFilter] = React.useState<string | 'ALL'>('ALL');
  const [showVulnerableRegions, setShowVulnerableRegions] = React.useState(true);
  const [showHazardPins, setShowHazardPins] = React.useState(true);
  const [showDamageReports, setShowDamageReports] = React.useState(true);

  const filteredEvacuationSites =
    evacTypeFilter === 'ALL'
      ? evacuationSites
      : evacuationSites.filter(
          (e) => (e.type ?? '').trim().toLowerCase() === evacTypeFilter.toLowerCase(),
        );

  const filteredVulnerableRegions = showVulnerableRegions ? (vulnerableRegions as any) : [];
  const filteredHazardPins =
    showHazardPins && Array.isArray(hazardPins) ? (hazardPins as any) : [];
  const filteredDamageReports =
    showDamageReports && Array.isArray(damageReports) ? (damageReports as any) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="space-y-1">
        <h1 className="text-2xl font-display font-bold wira-card-title leading-tight">Kuching, Sarawak</h1>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-status-safe"></span>
          <p className="text-xs font-body font-medium text-wira-earth/70 uppercase tracking-wider">Status: Secure</p>
        </div>
      </header>

      {/* Map Interactive Component */}
      <div className="relative">
        {pickLocationFor && (
          <div className="absolute top-4 left-4 right-4 z-10 animate-slide-up">
            <div className="bg-wira-teal text-white rounded-2xl p-4 shadow-xl border border-wira-teal-dark">
              <p className="text-sm font-body font-semibold">Tap map to set location</p>
              <p className="text-xs font-body opacity-90 mt-0.5">
                {pickLocationFor === 'hazard' ? 'Where is the hazard?' : 'Where do you need help?'}
              </p>
            </div>
          </div>
        )}
        {/* Filters */}
        <div className="mb-3 flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-display uppercase tracking-widest text-wira-earth/60">
              Evac types
            </span>
            <button
              type="button"
              onClick={() => setEvacTypeFilter('ALL')}
              className={`px-2 py-1 rounded-full text-[10px] font-body ${
                evacTypeFilter === 'ALL'
                  ? 'bg-wira-teal text-white'
                  : 'bg-white text-wira-earth/70 border border-wira-ivory-dark'
              }`}
            >
              All
            </button>
            {evacTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setEvacTypeFilter(t)}
                className={`px-2 py-1 rounded-full text-[10px] font-body ${
                  evacTypeFilter === t
                    ? 'bg-wira-teal text-white'
                    : 'bg-white text-wira-earth/70 border border-wira-ivory-dark'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto text-[10px] font-body text-wira-earth/70">
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showVulnerableRegions}
                onChange={(e) => setShowVulnerableRegions(e.target.checked)}
                className="h-3 w-3 rounded border-wira-ivory-dark"
              />
              <span>Risk areas</span>
            </label>
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showHazardPins}
                onChange={(e) => setShowHazardPins(e.target.checked)}
                className="h-3 w-3 rounded border-wira-ivory-dark"
              />
              <span>Hazard pins</span>
            </label>
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showDamageReports}
                onChange={(e) => setShowDamageReports(e.target.checked)}
                className="h-3 w-3 rounded border-wira-ivory-dark"
              />
              <span>Damage reports</span>
            </label>
            <label className="inline-flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={showRiskLayer}
                onChange={(e) => setShowRiskLayer(e.target.checked)}
                className="h-3 w-3 rounded border-wira-ivory-dark"
              />
              <span>Risk layer</span>
            </label>
          </div>
        </div>

        <MapComponent 
          weatherLocation={activeLoc} 
          vulnerableRegions={filteredVulnerableRegions} 
          helpRequests={showAllPins ? (openRequests as any) : []}
          hazardPins={filteredHazardPins}
          damageReports={filteredDamageReports}
          focusedHelpRequestId={focusedHelpRequestId}
          mapFocus={mapFocus}
          homeLocation={homeLocation}
          evacuationSites={filteredEvacuationSites}
          onEvacClick={(evac) => {
            setMapFocus({ latitude: evac.latitude, longitude: evac.longitude });
            setMapFocusLabel('Evacuation site');
            setMapFocusEvac(evac);
          }}
          routeGeometry={routeGeometry}
          hazardRouteGeometry={hazardRouteGeometry}
          hazardRiskPoints={showRiskLayer ? hazardRiskPoints : []}
          routeEta={routeEta}
          onMapClick={
            pickLocationFor && onLocationPicked
              ? (lat, lon) => onLocationPicked(lat, lon)
              : (lat, lon) => setSelectedLocationForWeather({ latitude: lat, longitude: lon })
          }
        />

        {/* Weather for clicked point (no map reload) */}
        {selectedLocationForWeather && !pickLocationFor && (
          <div className="absolute bottom-4 left-4 right-4 z-10 animate-slide-up">
            <div className="bg-white/90 backdrop-blur-md border border-wira-teal/20 rounded-2xl p-3 shadow-lg flex items-center justify-between">
              <div>
                <p className="text-[10px] font-display font-bold uppercase tracking-widest text-wira-teal">
                  Weather at selected point
                </p>
                <p className="text-[10px] font-body text-wira-earth/60">
                  {selectedLocationForWeather.latitude.toFixed(3)},{' '}
                  {selectedLocationForWeather.longitude.toFixed(3)}
                </p>
                {/* Keep this defensive: structure of forecast may change */}
                {(() => {
                  const f: any = clickedForecast;
                  const temp =
                    f?.current?.temperature ??
                    f?.currentTemperature ??
                    f?.summary?.temperature ??
                    null;
                  return temp != null ? (
                    <p className="text-xs font-body text-wira-earth mt-0.5">
                      Approx. temperature: {Math.round(temp)}°
                    </p>
                  ) : null;
                })()}
              </div>
              <button
                type="button"
                onClick={() => setSelectedLocationForWeather(null)}
                className="h-7 w-7 rounded-full bg-wira-earth/5 flex items-center justify-center text-wira-earth/40 hover:bg-wira-earth/10 hover:text-wira-earth transition-all"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {mapFocus && !pickLocationFor && (
          <div className="absolute top-4 left-4 right-4 animate-slide-down space-y-2">
            <div className="bg-white/90 backdrop-blur-md border border-wira-teal/20 rounded-2xl p-4 shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-wira-gold/10 flex items-center justify-center">
                  <Navigation2 size={20} className="text-wira-gold animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] font-display font-bold uppercase tracking-widest text-wira-gold">
                    Navigating to {mapFocusLabel ?? 'destination'}
                    {mapFocusEvac?.type && ` · ${mapFocusEvac.type}`}
                  </p>
                  {(mapFocusEvac?.capacity ?? mapFocusEvac?.source) && (
                    <p className="text-[10px] font-body text-wira-earth/60 mt-0.5">
                      {[mapFocusEvac?.capacity && `Capacity ${mapFocusEvac.capacity}`, mapFocusEvac?.source].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className="text-xs font-body text-wira-earth/60">
                    Route from {routeOrigin === 'home' ? 'home' : 'current location'}
                  </p>
                  {routeEta && (
                    <p className="text-xs font-body text-wira-teal font-medium mt-0.5">
                      ETA ~{Math.round(routeEta.durationSeconds / 60)} min · {(routeEta.distanceMeters / 1000).toFixed(1)} km
                    </p>
                  )}
                </div>
              </div>
              <button 
                onClick={onCancelRouting}
                className="h-8 w-8 rounded-full bg-wira-earth/5 flex items-center justify-center text-wira-earth/40 hover:bg-status-critical/10 hover:text-status-critical transition-all"
              >
                <X size={16} />
              </button>
            </div>
            {homeLocation && (
              <div className="flex rounded-xl overflow-hidden border border-wira-teal/20 bg-white/90 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setRouteOrigin('current')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-body font-bold transition-colors ${routeOrigin === 'current' ? 'bg-wira-teal text-white' : 'text-wira-earth/70 hover:bg-wira-teal/10'}`}
                >
                  <MapPin size={14} />
                  Current
                </button>
                <button
                  type="button"
                  onClick={() => setRouteOrigin('home')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-body font-bold transition-colors ${routeOrigin === 'home' ? 'bg-wira-teal text-white' : 'text-wira-earth/70 hover:bg-wira-teal/10'}`}
                >
                  <Home size={14} />
                  Home
                </button>
              </div>
            )}
          </div>
        )}
      </div>


    </div>
  );
}


