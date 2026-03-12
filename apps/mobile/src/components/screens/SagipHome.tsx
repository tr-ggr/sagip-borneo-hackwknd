'use client';

import { ChatFAB } from '../sagip/ChatFAB';
import { HeroSection } from '../sagip/HeroSection';
import { ManagementPhases } from '../sagip/ManagementPhases';
import { RegionalMeshMap } from '../sagip/RegionalMeshMap';

type SagipHomeProps = {
  onOpenMap?: () => void;
  onOpenChat?: () => void;
};

export default function SagipHome({ onOpenMap, onOpenChat }: SagipHomeProps) {
  return (
    <div className="flex flex-col items-start w-full min-h-full relative bg-[var(--sagip-bg)]">
      <HeroSection />
      <div className="flex flex-1 flex-col gap-4 min-h-0 pb-11 pt-4 px-4 w-full">
        <ManagementPhases />
        <RegionalMeshMap onOpenMap={onOpenMap} />
      </div>
      <div className="h-24 shrink-0 w-full" aria-hidden />
      <ChatFAB onOpenChat={onOpenChat} />
    </div>
  );
}
