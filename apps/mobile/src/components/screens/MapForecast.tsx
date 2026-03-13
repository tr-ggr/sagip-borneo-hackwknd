'use client';

import React, { useRef } from 'react';

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
} from '@wira-borneo/api-client';
import MapComponent, { type EvacuationSite, type MapComponentHandle } from '../MapComponent';
import { X, Navigation2, MapPin, Home, Plus, Minus, Locate, Layers, Building2, Wind, CheckCircle } from 'lucide-react';
import { useI18n } from '../../i18n/context';

function weatherCodeToKey(code: number): string {
  if (code === 0) return 'map.clear';
  if (code <= 3) return 'map.mainlyClear';
  if (code <= 48) return 'map.fog';
  if (code <= 67) return 'map.rain';
  if (code <= 77) return 'map.snow';
  if (code <= 82) return 'map.showers';
  if (code <= 86) return 'map.snowShowers';
  if (code === 95) return 'map.thunderstorm';
  return 'map.variable';
}

export type RouteOrigin = 'current' | 'home';

function hasValidCoordinates(latitude: unknown, longitude: unknown): latitude is number {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffMins < 1) return 'JUST NOW';
  if (diffMins < 60) return `${diffMins} MINS AGO`;
  if (diffHours < 24) return `${diffHours} HRS AGO`;
  return `${diffDays} DAYS AGO`;
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
  onSelectHelpRequest,
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
  onSelectHelpRequest?: (id: string, location: { latitude: number; longitude: number }) => void;
}) {
  const { t } = useI18n();
  const mapRef = useRef<MapComponentHandle>(null);
  const [layersOpen, setLayersOpen] = React.useState(false);
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
  const { data: clickedForecast, isLoading: isForecastLoading } = useRiskIntelligenceControllerGetForecast(
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
  const [showHelpRequests, setShowHelpRequests] = React.useState(true);
  const [showElderly, setShowElderly] = React.useState(false);
  const [showChildren, setShowChildren] = React.useState(false);
  const [showPWDs, setShowPWDs] = React.useState(false);

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
    <div className="absolute inset-0 flex flex-col min-h-0 animate-fade-in">
      <div className="relative flex-1 min-h-0 flex flex-col">
        {pickLocationFor && (
          <div className="absolute top-4 left-4 right-4 z-20 animate-slide-up">
            <div className="bg-wira-teal text-white rounded-2xl p-4 shadow-xl border border-wira-teal-dark">
              <p className="text-sm font-body font-semibold">{t('map.tapMapSetLocation')}</p>
              <p className="text-xs font-body opacity-90 mt-0.5">
                {pickLocationFor === 'hazard' ? t('map.whereHazard') : t('map.whereHelp')}
              </p>
            </div>
          </div>
        )}

        {/* Layers panel + map controls: flex row when open (no overlap), separate when closed */}
        {layersOpen ? (
          <div className="absolute top-4 left-4 right-4 z-20 flex flex-row gap-3 items-start">
            <div className="flex-1 min-w-0 max-w-sm animate-slide-up bg-white border border-wira-earth/10 rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-display font-bold uppercase tracking-widest text-wira-earth">{t('map.mapLayers')}</span>
                <button type="button" onClick={() => setLayersOpen(false)} className="p-1.5 rounded-full hover:bg-wira-earth/5 text-wira-earth/70" aria-label={t('map.ariaCloseLayers')}>
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-display uppercase tracking-widest text-wira-earth/60">{t('map.evacTypes')}</p>
                <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-1 min-w-0 [&::-webkit-scrollbar]:h-1">
                  <button type="button" onClick={() => setEvacTypeFilter('ALL')} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-body ${evacTypeFilter === 'ALL' ? 'bg-wira-teal text-white' : 'bg-white text-wira-earth border border-wira-earth/20 hover:border-wira-earth/30'}`}>{t('map.all')}</button>
                  {evacTypes.map((evacType) => (
                    <button key={evacType} type="button" onClick={() => setEvacTypeFilter(evacType)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-body ${evacTypeFilter === evacType ? 'bg-wira-teal text-white' : 'bg-white text-wira-earth border border-wira-earth/20 hover:border-wira-earth/30'}`}>{evacType}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 pt-0">
                <p className="text-[11px] font-display uppercase tracking-widest text-wira-earth/80">{t('map.mapLayers')}</p>
                <div className="space-y-2">
                  {[
                    { checked: showVulnerableRegions, set: setShowVulnerableRegions, label: t('map.riskAreas') },
                    { checked: showHazardPins, set: setShowHazardPins, label: t('map.hazardPins') },
                    { checked: showDamageReports, set: setShowDamageReports, label: t('map.damageReports') },
                    { checked: showHelpRequests, set: setShowHelpRequests, label: t('map.helpRequests') },
                  ].map(({ checked, set, label }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm font-body text-wira-earth">{label}</span>
                      <button type="button" role="switch" aria-checked={checked} onClick={() => set(!checked)} className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-wira-teal/30 ${checked ? 'bg-wira-teal' : 'bg-sagip-border'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-[left] ${checked ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-wira-earth/10 space-y-2">
                <p className="text-[11px] font-display uppercase tracking-widest text-wira-earth/60">{t('map.vulnerability')}</p>
                <div className="space-y-2">
                  {[
                    { checked: showElderly, set: setShowElderly, label: t('map.elderly') },
                    { checked: showChildren, set: setShowChildren, label: t('map.children') },
                    { checked: showPWDs, set: setShowPWDs, label: t('map.pwds') },
                  ].map(({ checked, set, label }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm font-body text-wira-earth">{label}</span>
                      <button type="button" role="switch" aria-checked={checked} onClick={() => set(!checked)} className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-wira-teal/30 ${checked ? 'bg-wira-teal' : 'bg-sagip-border'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-[left] ${checked ? 'left-5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-wira-earth/10 space-y-2">
                <span className="text-sm font-display font-bold text-wira-earth">{t('map.floodRisk')}</span>
                <div className="space-y-1.5 text-xs font-body text-wira-earth/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-status-critical)]" aria-hidden />
                    <span>{t('map.highRiskEvacuate')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-status-warning)]" aria-hidden />
                    <span>{t('map.moderateRisk')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-status-safe)]" aria-hidden />
                    <span>{t('map.lowRisk')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex flex-col gap-1 bg-white/95 backdrop-blur-md rounded-xl border border-wira-teal/20 shadow-lg p-1">
              <button type="button" onClick={() => mapRef.current?.zoomIn()} className="flex items-center justify-center size-11 rounded-lg hover:bg-wira-earth/5 text-wira-earth transition-colors" aria-label={t('map.ariaZoomIn')}>
                <Plus size={20} />
              </button>
              <button type="button" onClick={() => mapRef.current?.zoomOut()} className="flex items-center justify-center size-11 rounded-lg hover:bg-wira-earth/5 text-wira-earth transition-colors" aria-label={t('map.ariaZoomOut')}>
                <Minus size={20} />
              </button>
              <button type="button" onClick={() => mapRef.current?.centerOnUser()} className="flex items-center justify-center size-11 rounded-lg hover:bg-wira-earth/5 text-wira-earth transition-colors" aria-label={t('map.ariaCenterOnMe')}>
                <Locate size={20} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <button type="button" onClick={() => setLayersOpen(true)} className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-xl border border-wira-teal/20 shadow-lg px-3 py-2.5 text-wira-earth font-body text-sm font-medium hover:bg-wira-earth/5 transition-colors" aria-label={t('map.ariaOpenLayers')}>
              <Layers size={18} />
              <span>{t('map.mapLayers')}</span>
            </button>
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-1 bg-white/95 backdrop-blur-md rounded-xl border border-wira-teal/20 shadow-lg p-1">
              <button type="button" onClick={() => mapRef.current?.zoomIn()} className="flex items-center justify-center size-11 rounded-lg hover:bg-wira-earth/5 text-wira-earth transition-colors" aria-label={t('map.ariaZoomIn')}>
                <Plus size={20} />
              </button>
              <button type="button" onClick={() => mapRef.current?.zoomOut()} className="flex items-center justify-center size-11 rounded-lg hover:bg-wira-earth/5 text-wira-earth transition-colors" aria-label={t('map.ariaZoomOut')}>
                <Minus size={20} />
              </button>
              <button type="button" onClick={() => mapRef.current?.centerOnUser()} className="flex items-center justify-center size-11 rounded-lg hover:bg-wira-earth/5 text-wira-earth transition-colors" aria-label={t('map.ariaCenterOnMe')}>
                <Locate size={20} />
              </button>
            </div>
          </>
        )}

        {/* Verified Needs Triage panel — above map actions bar (bar is in LayoutWrapper) */}
        {onSelectHelpRequest && Array.isArray(openRequests) && openRequests.length > 0 && (
          <div
            className="absolute left-0 right-0 z-10 overflow-hidden rounded-t-2xl bg-white/95 backdrop-blur-md border border-wira-earth/10 border-b-0 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
            style={{
              bottom: '0.5rem',
              maxHeight: '40vh',
            }}
          >
            <div className="h-1 w-10 mx-auto mt-1.5 rounded-full bg-wira-earth/20 shrink-0" aria-hidden />
            <div className="flex items-center justify-between px-4 pt-2 pb-2 border-b border-wira-earth/10">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-status-safe shrink-0" />
                <span className="font-sagip font-bold text-sm text-wira-earth">{t('map.verifiedNeedsTriage')}</span>
              </div>
              <span className="shrink-0 rounded-full bg-status-safe/20 text-status-safe text-[10px] font-sagip font-bold uppercase tracking-wider px-2.5 py-1">
                {openRequests.length} {t('map.triageActive')}
              </span>
            </div>
            <div className="overflow-y-auto max-h-[calc(40vh-4rem)] min-h-0">
              {(openRequests as { id: string; latitude: number; longitude: number; urgency?: string; hazardType?: string; description?: string; createdAt?: string; triageCategory?: string; requester?: { name?: string } }[]).map((req) => {
                const isCritical = req.urgency === 'CRITICAL';
                const isHigh = req.urgency === 'HIGH';
                const tagClass = isCritical
                  ? 'border-status-critical text-status-critical bg-status-critical/5'
                  : isHigh
                    ? 'border-status-warning text-status-warning bg-status-warning/5'
                    : 'border-wira-earth/30 text-wira-earth/80 bg-wira-earth/5';
                const title = (req.description && req.description.trim().length > 0)
                  ? (req.description.length > 40 ? req.description.slice(0, 40) + '…' : req.description)
                  : t('map.triageHelpRequestFallback');
                return (
                  <button
                    key={req.id}
                    type="button"
                    onClick={() => onSelectHelpRequest(req.id, { latitude: req.latitude, longitude: req.longitude })}
                    className="w-full flex gap-3 items-start text-left px-4 py-3 border-b border-wira-earth/5 last:border-b-0 hover:bg-wira-earth/5 transition-colors"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-asean-blue/10 flex items-center justify-center">
                      <Building2 size={20} className="text-asean-blue" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-sagip font-semibold text-sm text-wira-earth truncate">{title}</p>
                      {req.description && req.description !== title && (
                        <p className="text-xs font-body text-wira-earth/70 mt-0.5 line-clamp-2">{req.description}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {req.urgency && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-sagip font-bold uppercase border ${tagClass}`}>
                            {req.urgency}
                          </span>
                        )}
                        {req.hazardType && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-sagip font-bold uppercase border ${tagClass}`}>
                            {req.hazardType.replace(/_/g, ' ')}
                          </span>
                        )}
                        {req.triageCategory && req.triageCategory !== req.hazardType && (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-sagip font-bold uppercase border ${tagClass}`}>
                            {String(req.triageCategory).replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </div>
                    {req.createdAt && (
                      <span className="shrink-0 text-[10px] font-sagip font-medium text-wira-earth/60 whitespace-nowrap">
                        {formatRelativeTime(req.createdAt)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 h-full rounded-none">
        <MapComponent
          ref={mapRef}
          fillContainer
          weatherLocation={activeLoc} 
          vulnerableRegions={filteredVulnerableRegions} 
          helpRequests={showAllPins && showHelpRequests ? (openRequests as any) : []}
          hazardPins={filteredHazardPins}
          damageReports={filteredDamageReports}
          focusedHelpRequestId={focusedHelpRequestId}
          mapFocus={mapFocus}
          homeLocation={homeLocation}
          evacuationSites={filteredEvacuationSites}
          onEvacClick={(evac) => {
            setMapFocus({ latitude: evac.latitude, longitude: evac.longitude });
            setMapFocusLabel(t('map.evacuationSite'));
            setMapFocusEvac(evac);
          }}
          routeGeometry={routeGeometry}
          hazardRouteGeometry={hazardRouteGeometry}
          routeEta={routeEta}
          selectedPoint={selectedLocationForWeather}
          onUserPosition={(lat, lon) => {
            if (!hasValidCoordinates(lat, lon)) return;
            setUserLocation({ latitude: lat, longitude: lon });
            updateLocationSnapshot.mutate({ data: { latitude: lat, longitude: lon } });
          }}
          onMapClick={
            pickLocationFor && onLocationPicked
              ? (lat, lon) => onLocationPicked(lat, lon)
              : (lat, lon) => setSelectedLocationForWeather({ latitude: lat, longitude: lon })
          }
        />
        </div>

        {/* Weather for clicked point — bottom, high z-index so never blocked */}
        {selectedLocationForWeather && !pickLocationFor && (
          <div className="absolute bottom-4 left-4 right-4 z-30 animate-slide-up">
            <div className="bg-white border border-wira-teal/30 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 flex flex-col gap-1">
                <p className="text-[10px] font-sagip font-bold uppercase tracking-widest text-wira-teal">
                  {t('map.weatherAtPoint')}
                </p>
                {isForecastLoading ? (
                  <>
                    <p className="text-sm font-sagip font-normal text-wira-earth/70">{t('map.loadingWeather')}</p>
                    <p className="text-[10px] font-sagip font-normal text-wira-earth/50">
                      {selectedLocationForWeather.latitude.toFixed(3)}, {selectedLocationForWeather.longitude.toFixed(3)}
                    </p>
                  </>
                ) : (
                  (() => {
                    const forecastPayload = clickedForecast as { forecast?: { current_weather?: { temperature?: number; weathercode?: number; windspeed?: number }; hourly?: { temperature_2m?: (number | null)[] } } } | null | undefined;
                    const cw = forecastPayload?.forecast?.current_weather;
                    const hourly = forecastPayload?.forecast?.hourly?.temperature_2m;
                    const temp =
                      cw?.temperature != null
                        ? Number(cw.temperature)
                        : Array.isArray(hourly) && hourly.length > 0 && hourly[0] != null
                          ? Number(hourly[0])
                          : null;
                    const weatherCode = cw?.weathercode != null ? Number(cw.weathercode) : null;
                    const windSpeed = cw?.windspeed != null ? Number(cw.windspeed) : null;
                    const conditionLabel =
                      weatherCode != null ? t(weatherCodeToKey(weatherCode)) : null;
                    return (
                      <>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          {temp != null && (
                            <span className="text-xl font-sagip font-bold text-wira-earth">
                              {Math.round(temp)}°
                            </span>
                          )}
                          {conditionLabel != null && (
                            <span className="text-sm font-sagip font-medium text-wira-earth/80">
                              {conditionLabel}
                            </span>
                          )}
                          {windSpeed != null && (
                            <span className="flex items-center gap-1 text-sm font-sagip font-normal text-wira-earth/70">
                              <Wind size={14} className="text-wira-teal shrink-0" />
                              {Math.round(windSpeed)} km/h
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-sagip font-normal text-wira-earth/50">
                          {selectedLocationForWeather.latitude.toFixed(3)}, {selectedLocationForWeather.longitude.toFixed(3)}
                        </p>
                      </>
                    );
                  })()
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedLocationForWeather(null)}
                className="h-8 w-8 shrink-0 rounded-full bg-wira-earth/5 flex items-center justify-center text-wira-earth/50 hover:bg-wira-earth/10 hover:text-wira-earth transition-all"
                aria-label="Close weather panel"
              >
                <X size={16} />
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
                    {t('map.navigatingTo')} {mapFocusLabel ?? t('map.destination')}
                    {mapFocusEvac?.type && ` · ${mapFocusEvac.type}`}
                  </p>
                  {(mapFocusEvac?.capacity ?? mapFocusEvac?.source) && (
                    <p className="text-[10px] font-body text-wira-earth/60 mt-0.5">
                      {[mapFocusEvac?.capacity && `Capacity ${mapFocusEvac.capacity}`, mapFocusEvac?.source].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <p className="text-xs font-body text-wira-earth/60">
                    {routeOrigin === 'home' ? t('map.routeFromHome') : t('map.routeFromCurrent')}
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
                  {t('map.current')}
                </button>
                <button
                  type="button"
                  onClick={() => setRouteOrigin('home')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-body font-bold transition-colors ${routeOrigin === 'home' ? 'bg-wira-teal text-white' : 'text-wira-earth/70 hover:bg-wira-teal/10'}`}
                >
                  <Home size={14} />
                  {t('map.home')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>


    </div>
  );
}


