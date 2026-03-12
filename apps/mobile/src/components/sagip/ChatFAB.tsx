'use client';

import { MessageSquare } from 'lucide-react';

type ChatFABProps = {
  onOpenChat?: () => void;
};

export function ChatFAB({ onOpenChat }: ChatFABProps) {
  return (
    <div className="fixed left-auto right-6 bottom-[calc(var(--bottom-nav-height)+28px)] flex flex-col gap-1.5 items-end z-40">
      <div className="bg-white border-2 border-asean-blue/20 max-w-[200px] px-3.5 py-3.5 rounded-2xl shadow-lg relative">
        <p className="font-sagip font-bold text-asean-blue text-[10px] uppercase leading-[12.5px]">
          Ask SEA-LION about evacuations,
          <br />
          aid, or status.
        </p>
        <div
          className="absolute -bottom-[11px] right-5 size-[23px] rotate-45 bg-white border-b-2 border-r-2 border-asean-blue/20 rounded-br"
          aria-hidden
        />
      </div>
      <button
        type="button"
        onClick={onOpenChat}
        className="bg-asean-blue border-4 border-asean-yellow flex items-center justify-center overflow-hidden rounded-full size-16 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] p-1 text-white hover:opacity-90"
        aria-label="Open SEA-LION chat"
      >
        <MessageSquare className="size-7" />
      </button>
    </div>
  );
}
