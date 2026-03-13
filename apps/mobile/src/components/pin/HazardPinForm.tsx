'use client';

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { usePinsControllerCreate } from '@wira-borneo/api-client';
import FormLocationMap from '../FormLocationMap';

const HAZARD_TYPES = ['FLOOD', 'TYPHOON', 'EARTHQUAKE', 'AFTERSHOCK'] as const;
type HazardType = (typeof HAZARD_TYPES)[number];

interface HazardPinFormProps {
  location: { latitude: number; longitude: number } | null;
  onLocationChange: (loc: { latitude: number; longitude: number }) => void;
  onSuccess: () => void;
}

export default function HazardPinForm({
  location,
  onLocationChange,
  onSuccess,
}: HazardPinFormProps) {
  const [title, setTitle] = useState('');
  const [hazardType, setHazardType] = useState<HazardType>('FLOOD');
  const [note, setNote] = useState('');

  const { mutate: createPin, isPending } = usePinsControllerCreate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      alert('Location is required. Please enable GPS or tap the map to pick a location.');
      return;
    }
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      alert('Please enter a short title for the hazard.');
      return;
    }

    createPin(
      {
        data: {
          title: trimmedTitle,
          hazardType,
          latitude: location.latitude,
          longitude: location.longitude,
          note: note.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          onSuccess();
        },
        onError: () => {
          alert('Failed to submit hazard pin. Please try again.');
        },
      },
    );
  };

  const isValid =
    location && title.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="form-label">Short title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Flooded road near market"
            className="form-input-placeholder w-full bg-wira-ivory-dark/30 border border-wira-ivory-dark rounded-xl p-4 text-sm font-body text-wira-night focus:outline-none focus:ring-2 focus:ring-wira-teal/20"
            required
            maxLength={200}
          />
        </label>

        <label className="block space-y-2">
          <span className="form-label">Hazard type</span>
          <div className="grid grid-cols-2 gap-2">
            {HAZARD_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setHazardType(type)}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all ${
                  hazardType === type
                    ? 'bg-wira-teal text-white border-wira-teal shadow-md'
                    : 'bg-white text-wira-earth border-wira-ivory-dark hover:border-wira-teal/30'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </label>

        <label className="block space-y-2">
          <span className="form-label">Note (optional)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add details to help responders..."
            className="form-input-placeholder w-full bg-wira-ivory-dark/30 border border-wira-ivory-dark rounded-xl p-4 text-sm font-body text-wira-night focus:outline-none focus:ring-2 focus:ring-wira-teal/20 min-h-[80px]"
          />
        </label>

        <FormLocationMap
          location={location}
          onLocationChange={onLocationChange}
          label="Location"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !isValid}
        className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-display font-bold uppercase tracking-widest transition-all wira-btn-primary shadow-lg shadow-wira-teal/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send size={18} />
            Submit hazard pin
          </>
        )}
      </button>
    </form>
  );
}
