'use client';

import { MapPin } from 'lucide-react';

type RegionalMeshMapProps = {
  onOpenMap?: () => void;
};

export function RegionalMeshMap({ onOpenMap }: RegionalMeshMapProps) {
  return (
    <div className="border border-sagip-border rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.05)] overflow-hidden w-full flex-1 min-h-0 flex flex-col bg-transparent">
      <div className="bg-[#f1f5f9] border-b border-sagip-border flex items-center justify-between px-3 pt-3 pb-3">
        <h3 className="font-sagip font-bold text-sagip-heading text-xs tracking-[1.2px] uppercase leading-4">
          Regional Mesh Map
        </h3>
        <div className="flex items-center gap-1">
          <span className="bg-[#22c55e] rounded-full size-2 shrink-0" aria-hidden />
          <span className="font-sagip font-normal text-[#64748b] text-[10px] leading-[15px]">
            LIVE
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenMap}
        className="bg-[#cbd5e1] h-48 relative shrink-0 w-full flex flex-col items-center justify-center"
        aria-label="View full map"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-asean-blue/30 border-2 border-asean-blue flex items-center justify-center p-0.5 rounded-full size-12 text-asean-blue">
            <MapPin className="size-6" />
          </div>
        </div>
      </button>
    </div>
  );
}
