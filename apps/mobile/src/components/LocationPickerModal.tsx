'use client';

import React from 'react';
import { X } from 'lucide-react';
import MapComponent from './MapComponent';

interface LocationPickerModalProps {
  initialCenter: { latitude: number; longitude: number };
  onSelect: (latitude: number, longitude: number) => void;
  onClose: () => void;
  title?: string;
}

export default function LocationPickerModal({
  initialCenter,
  onSelect,
  onClose,
  title = 'Set location',
}: LocationPickerModalProps) {
  const handleMapClick = (lat: number, lon: number) => {
    onSelect(lat, lon);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-wira-ivory rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-wira-ivory-dark">
          <h3 className="text-lg font-display font-bold text-wira-night">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-wira-ivory-dark/50 text-wira-earth transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <p className="px-4 pt-3 text-sm text-wira-earth form-hint">Tap map to set location.</p>
        <div className="flex-1 min-h-[50vh] p-4 pt-2">
          <div className="w-full h-[55vh] rounded-xl overflow-hidden border border-wira-ivory-dark">
            <MapComponent
              weatherLocation={initialCenter}
              onMapClick={handleMapClick}
            />
          </div>
        </div>
        <div className="p-4 border-t border-wira-ivory-dark">
          <button
            type="button"
            onClick={onClose}
            className="wira-btn-primary py-3 rounded-xl bg-white border-2 border-wira-teal text-wira-teal hover:bg-wira-teal/5"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
