'use client';

import React from 'react';

import { 
  useRiskIntelligenceControllerGetForecast, 
  useRiskIntelligenceControllerGetVulnerableRegions,
  useHelpRequestsControllerListOpen
} from '@wira-borneo/api-client';
import MapComponent from '../MapComponent';
import { X, Navigation2 } from 'lucide-react';

export default function MapForecast({
  focusedHelpRequestId,
  mapFocus,
  showAllPins,
  onCancelRouting
}: {
  focusedHelpRequestId: string | null;
  mapFocus: { latitude: number, longitude: number } | null;
  showAllPins: boolean;
  onCancelRouting: () => void;
}) {
  const [userLocation, setUserLocation] = React.useState<{ latitude: number, longitude: number } | null>(null);

  React.useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      });
    }
  }, []);

  const activeLoc = mapFocus || userLocation || { latitude: 1.5533, longitude: 110.3592 };

  useRiskIntelligenceControllerGetForecast({
    latitude: activeLoc.latitude,
    longitude: activeLoc.longitude
  });

  const { data: vulnerableRegions } = useRiskIntelligenceControllerGetVulnerableRegions();
  const { data: openRequests } = useHelpRequestsControllerListOpen();

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
        <MapComponent 
          weatherLocation={activeLoc} 
          vulnerableRegions={vulnerableRegions as any} 
          helpRequests={showAllPins ? (openRequests as any) : []}
          focusedHelpRequestId={focusedHelpRequestId}
          mapFocus={mapFocus}
        />

        {mapFocus && (
          <div className="absolute top-4 left-4 right-4 animate-slide-down">
            <div className="bg-white/90 backdrop-blur-md border border-wira-teal/20 rounded-2xl p-4 shadow-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-wira-gold/10 flex items-center justify-center">
                  <Navigation2 size={20} className="text-wira-gold animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] font-display font-bold uppercase tracking-widest text-wira-gold">Navigating to Help Pin</p>
                  <p className="text-xs font-body text-wira-earth/60">Routing active from your location</p>
                </div>
              </div>
              <button 
                onClick={onCancelRouting}
                className="h-8 w-8 rounded-full bg-wira-earth/5 flex items-center justify-center text-wira-earth/40 hover:bg-status-critical/10 hover:text-status-critical transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>


    </div>
  );
}


