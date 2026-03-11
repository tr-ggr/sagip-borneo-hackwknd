'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import {
  AlertCircle,
  Thermometer,
  Wind,
  CloudRain,
  Bell,
  Navigation,
} from 'lucide-react';
import {
  useAuthControllerGetSession,
  useWarningsControllerMe,
  useWarningsControllerFamily,
  useRiskIntelligenceControllerGetForecast,
  useHazardRiskLayerControllerGetRiskLayer,
} from '@wira-borneo/api-client';

const FALLBACK_COORDS = { latitude: 1.5533, longitude: 110.3592 };

type FilterCategory = 'critical' | 'warning' | 'info' | 'all';

function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function severityToFilterCategory(severity: string): FilterCategory {
  const s = (severity ?? '').toLowerCase();
  if (s === 'critical') return 'critical';
  if (s === 'high' || s === 'moderate') return 'warning';
  return 'info';
}

function severityToCardStyle(severity: string): {
  border: string;
  label: string;
  labelColor: string;
} {
  const s = (severity ?? '').toLowerCase();
  if (s === 'critical') {
    return {
      border: 'border-l-asean-red',
      label: 'Immediate Action Required',
      labelColor: 'text-[#ff4500]',
    };
  }
  if (s === 'high' || s === 'moderate') {
    return {
      border: 'border-l-[#ffbf00]',
      label: 'Weather Advisory',
      labelColor: 'text-[#ffbf00]',
    };
  }
  return {
    border: 'border-l-asean-blue',
    label: 'System Update',
    labelColor: 'text-[#007ba7]',
  };
}

interface WarningData {
  id: string;
  title: string;
  message: string;
  hazardType: string;
  severity: string;
  startsAt: string;
  targetAreas?: { areaName: string }[];
  isFamily?: boolean;
}

export default function Warnings({
  onViewSafeRoute,
  onOpenMap,
  onReportIncident,
}: {
  onViewSafeRoute?: (evac: { id: string; name: string; latitude: number; longitude: number; type?: string | null; capacity?: string | null; population?: string | null; source?: string | null }) => void;
  onOpenMap?: () => void;
  onReportIncident?: () => void;
}) {
  const { data: session } = useAuthControllerGetSession();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [mapLastUpdated, setMapLastUpdated] = useState<Date>(new Date());
  const situationMapRef = useRef<HTMLDivElement>(null);
  const situationMapInstanceRef = useRef<Map | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => {},
    );
  }, []);

  const coords = userLocation ?? FALLBACK_COORDS;

  useEffect(() => {
    const el = situationMapRef.current;
    if (!el || situationMapInstanceRef.current) return;

    const center = fromLonLat([coords.longitude, coords.latitude]);
    const view = new View({ center, zoom: 10 });
    const map = new Map({
      target: el,
      layers: [new TileLayer({ source: new OSM() })],
      view,
    });
    situationMapInstanceRef.current = map;

    return () => {
      map.setTarget(undefined);
      situationMapInstanceRef.current = null;
    };
  }, [coords.latitude, coords.longitude]);

  const { data: myWarningsRaw, isLoading: loadingMe, error: errorMe } = useWarningsControllerMe({
    query: { enabled: !!session?.user },
  });
  const { data: familyWarningsRaw, isLoading: loadingFamily, error: errorFamily } =
    useWarningsControllerFamily({ query: { enabled: !!session?.user } });

  const { data: forecastData } = useRiskIntelligenceControllerGetForecast(
    { latitude: coords.latitude, longitude: coords.longitude },
    { query: { enabled: true } },
  );

  const { data: riskLayerData } = useHazardRiskLayerControllerGetRiskLayer(
    { rainfall_mm: 0 },
    { query: { enabled: true } },
  );

  const warningsList = (Array.isArray(myWarningsRaw) ? myWarningsRaw : []) as WarningData[];
  const familyList = (Array.isArray(familyWarningsRaw) ? familyWarningsRaw : []) as WarningData[];

  const allWarningsById: Record<string, WarningData> = {};
  warningsList.forEach((w) => {
    allWarningsById[w.id] = { ...w, isFamily: false };
  });
  familyList.forEach((w) => {
    if (!allWarningsById[w.id]) allWarningsById[w.id] = { ...w, isFamily: true };
  });

  const sortedWarnings = Object.values(allWarningsById).sort(
    (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
  );

  const alertsWithMeta = useMemo(
    () =>
      sortedWarnings.map((w) => ({
        id: w.id,
        title: w.title ?? 'Warning',
        description: w.message ?? '',
        startsAt: w.startsAt,
        relativeTime: formatRelativeTime(w.startsAt),
        severity: w.severity ?? '',
        filterCategory: severityToFilterCategory(w.severity ?? ''),
        cardStyle: severityToCardStyle(w.severity ?? ''),
        isFamily: w.isFamily,
      })),
    [sortedWarnings],
  );

  const counts = useMemo(() => {
    let critical = 0;
    let warning = 0;
    let info = 0;
    alertsWithMeta.forEach((a) => {
      if (a.filterCategory === 'critical') critical++;
      else if (a.filterCategory === 'warning') warning++;
      else info++;
    });
    return { critical, warning, info };
  }, [alertsWithMeta]);

  const filteredAlerts = useMemo(() => {
    if (filterCategory === 'all') return alertsWithMeta;
    return alertsWithMeta.filter((a) => a.filterCategory === filterCategory);
  }, [alertsWithMeta, filterCategory]);

  const isLoading = (loadingMe || loadingFamily) && !!session?.user;
  const isError = (errorMe || errorFamily) && !!session?.user;

  const forecast = (forecastData as { forecast?: { hourly?: { temperature_2m?: number[]; wind_speed_10m?: number[] }; daily?: { precipitation_sum?: number[] } } } | undefined)?.forecast;
  const hourly = forecast?.hourly;
  const daily = forecast?.daily;
  const temp = hourly?.temperature_2m?.[0];
  const wind = hourly?.wind_speed_10m?.[0];
  const rain = daily?.precipitation_sum?.[0];

  const riskPoints = Array.isArray(riskLayerData) ? riskLayerData : [];
  const zoneLabel = riskPoints.length > 0 ? `Zone ${Math.min(4, riskPoints.length)}: High Risk` : 'View map';

  const mapUpdatedMins = Math.max(0, Math.floor((Date.now() - mapLastUpdated.getTime()) / 60_000));

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="tnalak-stripe w-full shrink-0 -mx-4" aria-hidden />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-sagip font-bold text-sagip-heading text-lg tracking-tight">Situation Map</h2>
          <div className="flex items-center gap-1 rounded-full bg-[#ff4500] px-2 py-0.5">
            <span className="size-2 rounded-full bg-white shrink-0" />
            <span className="font-sagip font-bold text-white text-xs">LIVE</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenMap}
          className="wira-card block w-full overflow-hidden rounded-xl border-2 border-white p-0 shadow-md aspect-video text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-asean-blue focus-visible:ring-offset-2 relative"
        >
          <div
            ref={situationMapRef}
            className="absolute inset-0 w-full h-full min-h-[140px]"
            aria-hidden
          />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 to-transparent">
            <div className="absolute bottom-3 left-3 right-12 flex flex-col gap-1">
              <span className="inline-flex w-fit rounded-full bg-[#ff4500] px-2 py-0.5 font-sagip font-bold text-white text-xs">
                {zoneLabel}
              </span>
              <span className="font-sagip text-[10px] font-medium uppercase tracking-wider text-white/90">
                Last updated: {mapUpdatedMins < 1 ? 'Just now' : `${mapUpdatedMins} mins ago`}
              </span>
            </div>
            <span
              className="absolute bottom-3 right-3 flex size-8 items-center justify-center rounded-full bg-white shadow-md"
              aria-hidden
            >
              <Navigation className="size-4 text-asean-blue" />
            </span>
          </div>
        </button>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilterCategory(filterCategory === 'critical' ? 'all' : 'critical')}
          className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 h-9 font-sagip font-bold text-sm shadow-sm ${
            filterCategory === 'critical'
              ? 'bg-[#ff4500] text-white'
              : 'border border-[#ff4500]/20 bg-[#ff4500]/10 text-[#ff4500]'
          }`}
        >
          <AlertCircle className="size-4 shrink-0" />
          Critical ({counts.critical})
        </button>
        <button
          type="button"
          onClick={() => setFilterCategory(filterCategory === 'warning' ? 'all' : 'warning')}
          className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 h-9 font-sagip font-bold text-sm ${
            filterCategory === 'warning'
              ? 'bg-[#ffbf00] text-sagip-heading border border-[#ffbf00]'
              : 'border border-[#ffbf00]/20 bg-[#ffbf00]/15 text-[#ffbf00]'
          }`}
        >
          <AlertCircle className="size-4 shrink-0" />
          Warning
        </button>
        <button
          type="button"
          onClick={() => setFilterCategory(filterCategory === 'info' ? 'all' : 'info')}
          className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 h-9 font-sagip font-bold text-sm ${
            filterCategory === 'info'
              ? 'bg-[#007ba7] text-white border border-[#007ba7]'
              : 'border border-[#007ba7]/20 bg-[#007ba7]/15 text-[#007ba7]'
          }`}
        >
          <AlertCircle className="size-4 shrink-0" />
          Info
        </button>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <div className="wira-card flex flex-col items-center gap-1 rounded-xl p-3">
          <Thermometer className="size-5 text-sagip-muted shrink-0" />
          <span className="font-sagip font-bold text-[10px] uppercase tracking-wider text-sagip-muted">Temp</span>
          <span className="font-sagip font-bold text-lg text-sagip-heading">{temp != null ? `${Math.round(temp)}°C` : '--'}</span>
        </div>
        <div className="wira-card flex flex-col items-center gap-1 rounded-xl p-3">
          <Wind className="size-5 text-sagip-muted shrink-0" />
          <span className="font-sagip font-bold text-[10px] uppercase tracking-wider text-sagip-muted">Wind</span>
          <span className="font-sagip font-bold text-lg text-sagip-heading">{wind != null ? `${Math.round(wind)} km/h` : '--'}</span>
        </div>
        <div className="wira-card flex flex-col items-center gap-1 rounded-xl p-3">
          <CloudRain className="size-5 text-sagip-muted shrink-0" />
          <span className="font-sagip font-bold text-[10px] uppercase tracking-wider text-sagip-muted">Rain</span>
          <span className="font-sagip font-bold text-lg text-sagip-heading">{rain != null ? `${rain} mm` : '--'}</span>
        </div>
      </section>

      {onReportIncident && (
        <button
          type="button"
          onClick={onReportIncident}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-asean-blue py-4 font-sagip font-bold text-base text-white shadow-lg transition-transform active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-asean-blue focus-visible:ring-offset-2"
        >
          <Bell className="size-5 shrink-0" />
          REPORT INCIDENT
        </button>
      )}

      <section className="space-y-3">
        <h3 className="font-sagip font-bold text-sm uppercase tracking-widest text-sagip-heading/80">Active Alerts</h3>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="h-10 w-10 rounded-full border-4 border-wira-teal border-t-transparent animate-spin" />
            <p className="text-sm font-body text-wira-earth/60">Fetching latest alerts...</p>
          </div>
        ) : isError ? (
          <div className="wira-card p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-critical/10 text-status-critical">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-lg font-display font-bold wira-card-title">Connection Error</h2>
            <p className="text-xs font-body wira-card-body leading-relaxed">
              We couldn&apos;t retrieve the latest warnings. Please check your connection or try again later.
            </p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="wira-card p-8 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-status-safe/10 text-status-safe">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-lg font-display font-bold wira-card-title">Everything is Clear</h2>
            <p className="text-xs font-body wira-card-body leading-relaxed">
              {filterCategory === 'all'
                ? 'No active warnings or hazards reported in your area at this time. Stay safe!'
                : `No ${filterCategory} alerts at this time.`}
            </p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {filteredAlerts.map((alert) => (
              <li key={alert.id}>
                <article
                  className={`wira-card flex border-l-4 pl-5 pr-4 py-4 rounded-lg shadow-sm ${alert.cardStyle.border}`}
                >
                  <div className="flex flex-1 min-w-0 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2 text-[10px]">
                      <span className={`font-sagip font-bold uppercase tracking-tight ${alert.cardStyle.labelColor}`}>
                        {alert.cardStyle.label}
                      </span>
                      <span className="font-sagip font-medium text-sagip-muted shrink-0">{alert.relativeTime}</span>
                    </div>
                    <h4 className="font-sagip font-bold text-base text-sagip-heading leading-tight">{alert.title}</h4>
                    <p className="text-xs font-body text-sagip-slate leading-relaxed line-clamp-2">{alert.description}</p>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>

      {!session?.user && (
        <p className="text-center text-[11px] font-body text-wira-earth/50">Sign in to see personalized warnings.</p>
      )}
    </div>
  );
}
