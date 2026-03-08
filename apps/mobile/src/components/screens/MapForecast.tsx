'use client';

import React from 'react';

import { useRiskIntelligenceControllerGetForecast, useRiskIntelligenceControllerGetVulnerableRegions } from '@wira-borneo/api-client';
import MapComponent from '../MapComponent';

export default function MapForecast() {
  const { data: forecast } = useRiskIntelligenceControllerGetForecast({
    latitude: undefined as any,
    longitude: undefined as any
  });

  const { data: vulnerableRegions } = useRiskIntelligenceControllerGetVulnerableRegions();

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
      <MapComponent 
        weatherLocation={(forecast as any)?.location} 
        vulnerableRegions={vulnerableRegions as any} 
      />


    </div>
  );
}


