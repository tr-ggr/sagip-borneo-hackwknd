'use client';

import React, { useState } from 'react';
import { Home, AlertTriangle, MapPin, User, Siren } from 'lucide-react';
import { MobileHeader } from './sagip/MobileHeader';
import { TnalakDivider } from './sagip/TnalakDivider';
import { MenuDrawer } from './sagip/MenuDrawer';
import {
  LanguageSelector,
  type LanguageOption,
} from './sagip/LanguageSelector';

const SCREEN_TITLES: Record<string, string> = {
  '/map': 'Map',
  '/warnings': 'Alerts',
  '/help': 'Help',
  '/profile': 'Mobile/Profile',
};

export default function LayoutWrapper({
  children,
  currentPath,
  onNavigate,
  showNav = true,
  onSignOut,
}: {
  children: React.ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
  showNav?: boolean;
  onSignOut?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [language, setLanguage] = useState<LanguageOption>('ENg');

  const isHome = currentPath === '/';
  const isSos = currentPath === '/sos';
  const isAssistant = currentPath === '/assistant';
  const showTnalak = isHome || isAssistant || currentPath === '/profile';

  const headerLanguageLabel = isAssistant ? 'BISAYA' : language;

  const renderHeader = () => {
    if (isHome) {
      return (
        <MobileHeader
          languageLabel={headerLanguageLabel}
          onMenuClick={() => setMenuOpen(true)}
          onLanguageClick={() => setLanguageOpen(true)}
        />
      );
    }
    if (isSos) {
      return (
        <MobileHeader
          showSecurePill
          languageLabel={headerLanguageLabel}
          onMenuClick={() => setMenuOpen(true)}
          onLanguageClick={() => setLanguageOpen(true)}
        />
      );
    }
    if (isAssistant) {
      return (
        <MobileHeader
          title="SEA-LION SAGIP"
          icon="message"
          status={{ label: 'AI Responder Active', dotColor: 'green' }}
          languageLabel={headerLanguageLabel}
          onMenuClick={() => setMenuOpen(true)}
          onLanguageClick={() => setLanguageOpen(true)}
        />
      );
    }
    const title = SCREEN_TITLES[currentPath] ?? 'WIRA';
    return (
      <MobileHeader
        title={title}
        status={{ label: 'Systems Online' }}
        languageLabel={headerLanguageLabel}
        onMenuClick={() => setMenuOpen(true)}
        onLanguageClick={() => setLanguageOpen(true)}
      />
    );
  };

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isHome || isAssistant ? 'bg-[var(--sagip-bg)]' : 'bg-wira-ivory wira-batik-bg'}`}>
      {renderHeader()}
      {showTnalak && <TnalakDivider />}

      <main className={`flex-1 ${showNav ? 'mobile-nav-safe' : 'pb-4'} ${isHome || isAssistant ? '' : 'px-4'} pt-0 ${isAssistant ? 'overflow-hidden min-h-0' : 'overflow-y-auto'} w-full max-w-md mx-auto scroll-smooth`}>
        {children}
      </main>

      <MenuDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={onNavigate}
        onSignOut={onSignOut}
        currentPath={currentPath}
      />
      <LanguageSelector
        open={languageOpen}
        onClose={() => setLanguageOpen(false)}
        currentLanguage={language}
        onSelect={setLanguage}
      />

      {showNav && (
        <nav className="sagip-bottom-nav">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex flex-col gap-0.5 items-center shrink-0 min-w-0 max-w-[72px] focus:outline-none focus-visible:ring-2 focus-visible:ring-asean-blue focus-visible:ring-offset-2 rounded-lg"
            aria-current={currentPath === '/' ? 'page' : undefined}
          >
            <Home className={`size-5 shrink-0 ${currentPath === '/' ? 'text-asean-blue' : 'text-slate-400'}`} />
            <span className={`font-sagip font-bold text-[9px] tracking-widest uppercase truncate w-full text-center ${currentPath === '/' ? 'text-asean-blue' : 'text-slate-400'}`}>
              Home
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/warnings')}
            className="flex flex-col gap-0.5 items-center shrink-0 min-w-0 max-w-[72px] focus:outline-none focus-visible:ring-2 focus-visible:ring-asean-blue focus-visible:ring-offset-2 rounded-lg"
            aria-current={currentPath === '/warnings' ? 'page' : undefined}
          >
            <AlertTriangle className={`size-5 shrink-0 ${currentPath === '/warnings' ? 'text-asean-blue' : 'text-slate-400'}`} />
            <span className={`font-sagip font-bold text-[9px] tracking-widest uppercase truncate w-full text-center ${currentPath === '/warnings' ? 'text-asean-blue' : 'text-slate-400'}`}>
              Alerts
            </span>
          </button>

          <div className="w-14 shrink-0 flex flex-col items-center justify-end relative h-full min-h-[52px] bg-transparent overflow-visible">
            <button
              type="button"
              onClick={() => onNavigate('/sos')}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center size-14 rounded-full bg-asean-red border-4 border-white shadow-[0_10px_15px_-3px_rgba(253,24,19,0.4),0_4px_6px_-4px_rgba(253,24,19,0.4)] p-1 text-white hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-asean-red focus-visible:ring-offset-2"
              aria-label="Emergency SOS"
            >
              <Siren className="size-6" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('/map')}
            className="flex flex-col gap-0.5 items-center shrink-0 min-w-0 max-w-[72px] focus:outline-none focus-visible:ring-2 focus-visible:ring-asean-blue focus-visible:ring-offset-2 rounded-lg"
            aria-current={currentPath === '/map' ? 'page' : undefined}
          >
            <MapPin className={`size-5 shrink-0 ${currentPath === '/map' ? 'text-asean-blue' : 'text-slate-400'}`} />
            <span className={`font-sagip font-bold text-[9px] tracking-widest uppercase truncate w-full text-center ${currentPath === '/map' ? 'text-asean-blue' : 'text-slate-400'}`}>
              Map
            </span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('/profile')}
            className="flex flex-col gap-0.5 items-center shrink-0 min-w-0 max-w-[72px] focus:outline-none focus-visible:ring-2 focus-visible:ring-asean-blue focus-visible:ring-offset-2 rounded-lg"
            aria-current={currentPath === '/profile' ? 'page' : undefined}
          >
            <User className={`size-5 shrink-0 ${currentPath === '/profile' ? 'text-asean-blue' : 'text-slate-400'}`} />
            <span className={`font-sagip font-bold text-[9px] tracking-widest uppercase truncate w-full text-center ${currentPath === '/profile' ? 'text-asean-blue' : 'text-slate-400'}`}>
              Profile
            </span>
          </button>
        </nav>
      )}
    </div>
  );
}
