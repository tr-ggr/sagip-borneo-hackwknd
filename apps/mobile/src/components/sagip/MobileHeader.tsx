'use client';

import { Globe, Menu, MessageSquare, Shield } from 'lucide-react';

const logoPath =
  'M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 2.18l7 3.5v7.82c0 4.52-2.98 8.69-7 9.93-4.02-1.24-7-5.41-7-9.93V7.68l7-3.5z';

export type MobileHeaderStatus = {
  label: string;
  dotColor?: 'green' | 'gray';
};

type MobileHeaderProps = {
  title?: string;
  icon?: 'logo' | 'message';
  status?: MobileHeaderStatus;
  languageLabel?: string;
  showSecurePill?: boolean;
  onMenuClick?: () => void;
  onLanguageClick?: () => void;
};

export function MobileHeader({
  title = 'SAGIP',
  icon = 'logo',
  status,
  languageLabel = 'ENg',
  showSecurePill = false,
  onMenuClick,
  onLanguageClick,
}: MobileHeaderProps) {
  const statusDotColor =
    status?.dotColor === 'gray' ? 'bg-status-offline' : 'bg-[#22c55e]';
  const statusTextColor =
    status?.dotColor === 'gray' ? 'text-status-offline' : 'text-[#22c55e]';

  return (
    <header className="bg-white flex items-center justify-between p-4 w-full shadow-[0_1px_2px_rgba(0,0,0,0.05)] shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 shrink-0">
          {icon === 'message' ? (
            <div className="bg-asean-blue flex items-center justify-center rounded-full size-10 text-white">
              <MessageSquare className="size-5" />
            </div>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="size-[22.5px] text-asean-blue"
              fill="currentColor"
              aria-hidden
            >
              <path d={logoPath} />
            </svg>
          )}
        </div>
        <div className={icon === 'message' ? '' : 'ml-7 flex flex-col px-3 pt-1.5'}>
          <h1
            className={`font-sagip font-bold tracking-tight leading-tight ${
              icon === 'message' ? 'text-sagip-heading text-sm' : 'text-asean-blue text-xl'
            }`}
          >
            {title}
          </h1>
          {status && (
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={`rounded-full size-1.5 shrink-0 ${statusDotColor}`}
                aria-hidden
              />
              <span
                className={`font-sagip font-medium text-[10px] leading-tight ${
                  statusTextColor
                }`}
              >
                {status.label}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        {showSecurePill && (
          <div className="bg-status-safe/10 border border-status-safe/20 flex items-center gap-1.5 pl-3 pr-3 py-1.5 rounded-full shrink-0">
            <Shield className="size-3.5 text-status-safe shrink-0" />
            <span className="font-sagip font-bold text-status-safe text-xs tracking-wide uppercase">
              Secure
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={onLanguageClick}
          className="bg-asean-blue/20 border border-asean-blue flex items-center px-3 py-1 rounded-full shadow-sm shrink-0 hover:bg-asean-blue/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-asean-blue focus-visible:ring-offset-2"
        >
          <Globe className="size-4 text-asean-blue shrink-0" />
          <span className="font-sagip font-bold text-asean-blue text-xs tracking-wide uppercase ml-1.5">
            {languageLabel}
          </span>
        </button>
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 rounded-md text-asean-blue hover:bg-asean-blue/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-asean-blue focus-visible:ring-offset-2"
          aria-label="Menu"
        >
          <Menu className="size-5" />
        </button>
      </div>
    </header>
  );
}
